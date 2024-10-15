const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export {asyncHandler};

// This can also be written as ->

// const asyncHandler = (fn) => async(err,req,res,next) =>{
//     try{
//         await fn(req,res,next);
//     }
//     catch(err){
//         res.status(err.code || 500).json({
//             message: err.message || 'Something has gone wrong!',
//             success: false
//         })
//     }
// }