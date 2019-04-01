import { ApiController } from "./controller/apiController";

export const Routes = [
    {
        method: "post",
        route: "/api/register",
        controller: ApiController,
        action: "registerStudent"
    },
    {
        method: "get",
        route: "/api/commonstudents",
        controller: ApiController,
        action: "getCommonStudents"
    },
    {
        method: "post",
        route: "/api/suspend",
        controller: ApiController,
        action: "suspendStudent"
    },
    {
        method: "post",
        route: "/api/retrievefornotifications",
        controller: ApiController,
        action: "retrieveStudents"
    }
];