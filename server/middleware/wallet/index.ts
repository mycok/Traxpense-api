export function authorize(req: any, res: any, next: Function) {
  const { wallet, auth } = req;

  if (`${wallet?.owner?._id}` !== auth._id) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to perform this action',
    });
  }

  return next();
}
