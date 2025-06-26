import { Chat, Project } from "./Schema.js";
import { v4 as uuid } from "uuid";

const SocketHandler = (socket) => {
  // Freelancer joining the chat room
  socket.on("join-chat-room", async ({ projectId, freelancerId }) => {
    const project = await Project.findById(projectId);

    if (project.freelancerId === freelancerId) {
      await socket.join(projectId);
      console.log(socket.rooms);

      socket.broadcast.to(projectId).emit("user-joined-room");

      // ✅ Upsert prevents duplicate key errors
      await Chat.findByIdAndUpdate(
        projectId,
        { $setOnInsert: { _id: projectId, messages: [] } },
        { upsert: true }
      );

      const chat = await Chat.findById(projectId);
      await socket.emit("messages-updated", { chat });
    }
  });

  // Client joining the chat room
  socket.on("join-chat-room-client", async ({ projectId }) => {
    const project = await Project.findById(projectId);

    if (project.status === "Assigned" || project.status === "Completed") {
      await socket.join(projectId);
      console.log(socket.rooms);

      socket.broadcast.to(projectId).emit("user-joined-room");

      // ✅ Upsert again
      await Chat.findByIdAndUpdate(
        projectId,
        { $setOnInsert: { _id: projectId, messages: [] } },
        { upsert: true }
      );

      const chat = await Chat.findById(projectId);
      await socket.emit("messages-updated", { chat });
    }
  });

  // Refresh chat messages
  socket.on("update-messages", async ({ projectId }) => {
    try {
      const chat = await Chat.findById(projectId);
      console.log("updating messages");
      socket.emit("messages-updated", { chat });
    } catch (error) {
      console.error("Error updating messages:", error);
    }
  });

  // New message pushed to chat
  socket.on("new-message", async ({ projectId, senderId, message, time }) => {
    try {
      await Chat.findOneAndUpdate(
        { _id: projectId },
        {
          $addToSet: {
            messages: { id: uuid(), text: message, senderId, time },
          },
        },
        { new: true }
      );

      const chat = await Chat.findById(projectId);
      console.log(chat);
      socket.emit("messages-updated", { chat });
      socket.broadcast.to(projectId).emit("message-from-user");
    } catch (error) {
      console.error("Error adding new message:", error);
    }
  });
};

export default SocketHandler;
