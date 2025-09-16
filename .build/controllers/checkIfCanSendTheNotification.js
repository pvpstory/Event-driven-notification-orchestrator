"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfCanSendTheNotification = checkIfCanSendTheNotification;
function checkIfCanSendTheNotification(endTime, startTime, eventTime) {
    const eventTimeDate = new Date(eventTime);
    let hoursEvent = eventTimeDate.getUTCHours();
    let minutesEvent = eventTimeDate.getUTCMinutes();
    const totalMinutesEvent = (hoursEvent * 60) + minutesEvent;
    let hoursStart = parseInt(startTime.substring(0, 2), 10);
    let minutesStart = parseInt(startTime.substring(3, 5), 10);
    const totalMinutesStart = (hoursStart * 60) + minutesStart;
    let hoursEnd = parseInt(endTime.substring(0, 2), 10);
    let minutesEnd = parseInt(endTime.substring(3, 5), 10);
    const totalMinutesEnd = (hoursEnd * 60) + minutesEnd;
    console.log(totalMinutesEvent, totalMinutesStart, totalMinutesEnd);
    if (totalMinutesEnd >= totalMinutesStart) { //asume they can be equal and it means dnd lasts one minute
        return totalMinutesEvent < totalMinutesStart || totalMinutesEvent > totalMinutesEnd;
    }
    else {
        return !(totalMinutesEvent >= totalMinutesStart || totalMinutesEvent <= totalMinutesEnd);
    }
}
