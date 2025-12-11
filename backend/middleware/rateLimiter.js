import ratelimit from "../config/upstash.js";

const rateLimiter = async (requset, response, next) => {
  try {
    const { success } = await ratelimit.limit("my-rate-limit");
    if (!success) {
      return response.status(429).json({
        message: "Too many requests, please try again later."
      });
    }

    next();
  } catch (error) {
    console.log("Rate limit error", error);
    next(error);
  }
}

export default rateLimiter;