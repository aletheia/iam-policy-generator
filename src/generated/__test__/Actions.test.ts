import {Action} from '../../index';

test('common actions exist', () => {
  const actions = [
    Action.S3.LIST_BUCKET,
    Action.S3.PUT_OBJECT,
    Action.EC2.DESCRIBE_IMAGES,
    Action.EC2_AUTO_SCALING.ATTACH_INSTANCES,
    Action.KINESIS.PUT_RECORD,
    Action.LAMBDA.INVOKE_FUNCTION,
    Action.STEP_FUNCTIONS.START_EXECUTION,
    Action.API_GATEWAY.INVOKE,
    Action.COGNITO_USER_POOLS.ADD_CUSTOM_ATTRIBUTES,
    Action.POLLY.SYNTHESIZE_SPEECH,
    Action.COMPREHEND.DETECT_SENTIMENT,
    Action.SAGEMAKER.START_NOTEBOOK_INSTANCE,
  ];
  actions.forEach(action => {
    expect(action).toBeDefined();
    expect(typeof action).toBe('string');
  });
});
