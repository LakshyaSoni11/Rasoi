import User from "./models/user.model.js"

export const socketHandler = async(io) =>{
    io.on("connection", (socket) => {
        socket.on("identity", async (data) => {
            try {
                if (!data?.userId) return;
                await User.findByIdAndUpdate(data.userId, {
                    socketId: socket.id,
                    isOnline: true
                }, { returnDocument: 'after' });
                
                socket.userId = data.userId;
                socket.join(`user_${data.userId}`); // Join user-specific room
            } catch (error) {
                console.log("Socket identity error:", error);
            }
        });

        socket.on("disconnect", async () => {
            try {
                if (socket.userId) {
                    await User.findByIdAndUpdate(socket.userId, {
                        isOnline: false,
                        socketId: ""
                    });
                }
            } catch (error) {
                console.log("Socket disconnect error:", error);
            }
        });
    });
}