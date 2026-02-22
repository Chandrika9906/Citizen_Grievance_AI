const Officer = require("../models/Officer");
const Complaint = require("../models/Complaint");
const { createNotification } = require("./notificationHelper");

async function autoAssignOfficer(complaintId, department) {
  try {
    if (!department) {
      console.log(`[ASSIGN] ❌ Missing department for complaint ${complaintId}`);
      return null;
    }

    const searchPattern = new RegExp(`^${department.replace(/s$/, '')}`, 'i');
    console.log(`[ASSIGN] Searching for FREE officer in ${department} using pattern: ${searchPattern}`);

    const officer = await Officer.findOne({
      department: { $regex: searchPattern },
      status: "FREE",
      verified: true
    });

    if (!officer) {
      console.log(`[ASSIGN] ❌ No FREE/VERIFIED officer found for department pattern ${searchPattern}`);
      return null;
    }

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        officerId: officer._id,
        status: "ASSIGNED",
        assignedDate: new Date()
      },
      { new: true }
    );

    await Officer.findByIdAndUpdate(officer._id, { status: "BUSY" });
    console.log(`[ASSIGN] Successfully matched ${officer.name} to ${complaintId}`);

    return officer;
  } catch (error) {
    console.error("Assignment error:", error);
    return null;
  }
}

async function freeOfficer(officerId) {
  try {
    const activeComplaints = await Complaint.countDocuments({
      officerId: officerId,
      status: { $in: ["ASSIGNED", "IN_PROGRESS"] }
    });

    if (activeComplaints > 0) {
      console.log(`[FREE] Officer ${officerId} still has ${activeComplaints} active tasks. Staying BUSY.`);
      return;
    }

    // Set officer as FREE initially
    const officer = await Officer.findByIdAndUpdate(officerId, { status: "FREE" }, { new: true });
    console.log(`[FREE] Officer ${officer.name} is now FREE. Searching for next task...`);

    // IMMEDIATELY try to find a WAITING complaint in their department
    const nextComplaint = await Complaint.findOne({
      department: officer.department,
      status: "WAITING"
    }).sort({ priority: -1 });

    if (nextComplaint) {
      console.log(`[FREE] Found next task ${nextComplaint._id} for officer ${officer.name}`);
      // Re-assign immediately
      await autoAssignOfficer(nextComplaint._id, officer.department);

      // Notify them
      await createNotification(
        officer._id,
        "warning",
        "Next Task Assigned",
        `You've been immediately assigned to the next pending issue: ${nextComplaint.description.substring(0, 30)}...`,
        nextComplaint._id
      );
    }
  } catch (error) {
    console.error("Free officer error:", error);
  }
}

module.exports = { autoAssignOfficer, freeOfficer };
