//define the logics of the routes inside profile.routes.js
import { getTargets, updateTargets } from '../services/profile.service.js';

//get the macros of the user and send it to the client
export async function getMyTargets(req, res) {
    try {
        //verifyAccess function which verify the access token will attach the user object into the req thats why we get the id from there and not from the body, all routes will be protected meaning will go through -> verifyAccess 
        const data = await getTargets(req.user.id);
        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
}
//put=update the Targets(Macros) of the user
export async function putMyTargets(req, res) {
    try {
        // if req.body is defined by client we use it so use the left side req.body, if not return an empty object which is the right side, thats what this is for "req.body ?? {}". Its like an ternary operator ? "value" : "anothervalue"
        const updatedData = await updateTargets(req.user.id, req.body ?? {});
        res.json(updatedData);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({error: error.message});
    }
}