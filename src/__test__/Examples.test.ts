import * as path from 'path';
import {PolicyStatementFactory, Action} from '../index';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs';
import * as s3 from '@aws-cdk/aws-s3';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as dax from '@aws-cdk/aws-dax';

test('README example should work =)', () => {
  class CdkLambdaFunctionStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);

      const exampleBucket = new s3.Bucket(this, 'exampleBucket');

      const exampleFunction = new NodejsFunction(this, 'exampleFunction', {
        entry: path.resolve(
          __dirname,
          '../../examples/cdk-lambda-function/lambda/example-function/index.ts'
        ),
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'index.handler',
      });

      exampleFunction.addToRolePolicy(
        new PolicyStatementFactory()
          .setEffect(iam.Effect.ALLOW)
          .addResource(exampleBucket.bucketArn)
          .addActions([Action.S3.LIST_BUCKET, Action.S3.PUT_OBJECT])
          .build()
      );
    }
  }

  const app = new cdk.App();
  new CdkLambdaFunctionStack(app, 'CdkLambdaFunctionStack');
});

test('more complex example with DAX', () => {
  interface DaxClusterProps extends cdk.StackProps {
    vpc: ec2.IVpc;
  }

  class DaxCluster extends cdk.Construct {
    protected id: string;
    protected securityGroup: ec2.SecurityGroup;
    protected connections: ec2.Connections;
    protected role: iam.Role;
    protected parameterGroup: dax.CfnParameterGroup;
    protected cluster: dax.CfnCluster;
    protected endpoint: string;
    protected policies: iam.Policy[];

    constructor(scope: cdk.Construct, id: string, props: DaxClusterProps) {
      super(scope, id);
      this.id = id;

      const targetVpc = props.vpc;

      // Define a group for telling Elasticache which subnets to put cache nodes in.
      const subnetGroup = new dax.CfnSubnetGroup(this, `${id}-subnet-group`, {
        description: `List of subnets used for dax cache ${id}`,
        subnetIds: targetVpc.privateSubnets.map(subnet => subnet.subnetId),
      });

      // The security group that defines network level access to the cluster
      this.securityGroup = new ec2.SecurityGroup(this, `${id}-security-group`, {
        vpc: targetVpc,
      });

      this.connections = new ec2.Connections({
        securityGroups: [this.securityGroup],
        defaultPort: new ec2.Port({
          protocol: ec2.Protocol.TCP,
          fromPort: 8111,
          toPort: 8111,
          stringRepresentation: 'TPC',
        }),
      });

      this.role = new iam.Role(this, `${id}-role`, {
        assumedBy: new iam.ServicePrincipal('dax.amazonaws.com'),
        description:
          'Role that allows DynamoDB Accelerator to talk to DynamoDB',
      });

      // The parameters for this cluster
      this.parameterGroup = new dax.CfnParameterGroup(
        this,
        '${id}-parameters',
        {
          parameterNameValues: {
            // Queries are only cached for 1 second, this reduces the load when there are bursts of
            // the same query, like perhaps the #ijustsignedup hashtag feed, but
            // otherwise keeps the data very fresh
            'query-ttl-millis': '1000',
            // Regular objects are cached for 30 seconds.
            'record-ttl-millis': '30000',
          },
        }
      );

      // The cluster resource itself.
      this.cluster = new dax.CfnCluster(this, `${id}-cluster`, {
        iamRoleArn: this.role.roleArn,
        nodeType: 'dax.r4.large',
        replicationFactor: 1,
        subnetGroupName: subnetGroup.ref,
        parameterGroupName: this.parameterGroup.ref,
        securityGroupIds: [this.securityGroup.securityGroupId],
      });

      this.endpoint = this.cluster.attrClusterDiscoveryEndpoint;

      this.policies = [];
    }

    // Add a table for the Dax cluster to be able to access
    // This helper method adds a Policy on the same stack as the table,
    // which allows the IAM role of this DAX cluster to talk to the table
    addTable(tableName: string, table: dynamodb.Table) {
      const destinationStack = cdk.Stack.of(table);

      const policy = new iam.Policy(
        destinationStack,
        `${this.id}-access-${tableName}`
      );

      policy.addStatements(
        new PolicyStatementFactory()
          .setEffect(iam.Effect.ALLOW)
          .addResource(table.tableArn)
          .addActions([
            Action.DYNAMODB.BATCH_GET_ITEM,
            Action.DYNAMODB.BATCH_WRITE_ITEM,
            Action.DYNAMODB.DELETE_ITEM,
            Action.DYNAMODB.GET_ITEM,
            Action.DYNAMODB.GET_RECORDS,
            Action.DYNAMODB.GET_SHARD_ITERATOR,
            Action.DYNAMODB.PUT_ITEM,
            Action.DYNAMODB.QUERY,
            Action.DYNAMODB.SCAN,
            Action.DYNAMODB.UPDATE_ITEM,
            Action.DYNAMODB.DESCRIBE_TABLE,
          ])
          .build()
      );

      // Attach the policy to the role of the DAX cluster
      policy.attachToRole(this.role);

      this.policies.push(policy);
    }

    // Grant the bearer of role permissions to talk to this DAX cluster.
    // This is needed because DAX has its own custom IAM permissions prefixed
    // with dax: instead of dynamodb:
    grantReadWriteData(grantee: iam.IGrantable) {
      return iam.Grant.addToPrincipal({
        grantee,
        actions: [
          // Permissions which map to DynamoDB
          Action.DYNAMODB_ACCELERATOR_DAX.GET_ITEM,
          Action.DYNAMODB_ACCELERATOR_DAX.BATCH_GET_ITEM,
          Action.DYNAMODB_ACCELERATOR_DAX.QUERY,
          Action.DYNAMODB_ACCELERATOR_DAX.SCAN,
          Action.DYNAMODB_ACCELERATOR_DAX.PUT_ITEM,
          Action.DYNAMODB_ACCELERATOR_DAX.UPDATE_ITEM,
          Action.DYNAMODB_ACCELERATOR_DAX.DELETE_ITEM,
          Action.DYNAMODB_ACCELERATOR_DAX.BATCH_WRITE_ITEM,
          Action.DYNAMODB_ACCELERATOR_DAX.CONDITION_CHECK_ITEM,

          // Dax specific permissions
          // TODO verify why these actions aren't defined!
          'dax:DefineAttributeList',
          'dax:DefineAttributeListId',
          'dax:DefineKeySchema',
          'dax:Endpoints',
        ],
        resourceArns: [this.cluster.attrArn],
        scope: this,
      });
    }
  }

  class DaxStack extends cdk.Stack {
    constructor(parent: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(parent, id, props);

      const vpc = new ec2.Vpc(this, 'Vpc', {maxAzs: 2});

      const daxCluster = new DaxCluster(this, 'chatter-dax', {
        vpc: vpc,
      });

      const messageTable = new dynamodb.Table(this, 'mytable', {
        partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      });

      const myCustomRole = new iam.Role(this, 'MyRole', {
        assumedBy: new iam.ServicePrincipal('ecs.amazonaws.com'),
      });

      daxCluster.addTable('mytable', messageTable);
      daxCluster.grantReadWriteData(myCustomRole);
    }
  }

  const app = new cdk.App();
  new DaxStack(app, 'DaxStack');
});
