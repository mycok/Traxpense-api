const getUniqueErrorMessage = (err: any): string => {
  let output: string;
  try {
    const fieldName = err.message.substring(
      err.message.lastIndexOf('.$') + 63,
      err.message.lastIndexOf('_1'),
    );
    output = `${fieldName.charAt(0).toUpperCase()}${fieldName.slice(
      1,
    )} already exists`;
  } catch (exept) {
    output = 'Unique field already exists';
  }
  return output;
};

export const handleErrorMessages = (err: any): string => {
  let errorMessage: string = '';
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        errorMessage = getUniqueErrorMessage(err);
        break;

      default:
        errorMessage = 'Something went wrong';
        break;
    }
  } else {
    const { errors } = err;
    const errorKeys = Object.keys(errors);

    errorKeys.forEach((key) => {
      if (errors[key].message) {
        const { message } = errors[key];
        errorMessage = message;
      }
    });
  }

  return errorMessage;
};
