export function authorize(req: any, res: any, next: Function) {
  const { expense, auth } = req;

  if (`${expense.recordedBy._id}` !== auth._id) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to perform this action',
    });
  }

  return next();
}
