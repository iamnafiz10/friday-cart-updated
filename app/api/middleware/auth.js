// import {getCurrentUser} from "@/lib/serverAuth";
//
// // Middleware for protecting server-side API routes
// export async function requireAuth(req, res, next) {
//     const user = await getCurrentUser(req);
//
//     if (!user) {
//         return res.status(401).json({error: "Unauthorized"});
//     }
//
//     // Attach user to request
//     req.user = user;
//
//     // Call the actual route handler
//     return next();
// }