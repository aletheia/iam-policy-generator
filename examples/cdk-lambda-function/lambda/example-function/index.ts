const handler = (event: JSON) => {
  return {
    statusCode: 200,
    message: `Hello World. Received ${JSON.stringify(event)}`,
  };
};

export {handler};
