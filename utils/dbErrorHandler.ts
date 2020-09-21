export const handleErrorMessages = (err: any): string => {
  let errorMessage: string = '';
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        errorMessage = 'Value already exists';
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
