import * as Action from '../generated/Actions';
import {PolicyFactory} from '../PolicyFactory';

test('should be defined', () => {
  expect(PolicyFactory).toBeDefined();
});

test('should accept valid actions', () => {
  const factory = new PolicyFactory();
  factory.addAction(Action.S3.PUT_OBJECT);
  factory.addAction(Action.KINESIS.DESCRIBE_STREAM);
  factory.addAction(Action.EC2.START_INSTANCES);

  const json = factory.buildPolicy();

  expect(JSON.parse(json).actions.length).toBe(3);
});

test('should not accept invalid actions', () => {
  const factory = new PolicyFactory();
  expect(() => {
    factory.addAction('invalidservice:invalidaction');
  }).toThrow();
});

test('should accept potentially invalid actions with addActionRaw', () => {
  const factory = new PolicyFactory();
  factory.addActionRaw('s3:Get*');
  factory.addActionRaw('dynamodb:Describe*');

  const json = factory.buildPolicy();
  expect(JSON.parse(json).actions.length).toBe(2);
});
