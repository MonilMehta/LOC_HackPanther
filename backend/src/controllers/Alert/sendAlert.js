import Alert from "../../models/alert.models.js";

const sendAlert = async (req, res) => {
    try {
      const { title, description, imageUrl, date } = req.body;
  
      const newAlert = new Alert({
        title,
        description,
        imageUrl,
        date
      });
  
      await newAlert.save();
  
      return res.status(201).json({ message: "Message sent successfully.", newAlert });
    } catch (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({ message: "Error sending message.", error: error.message });
    }
  };

export default sendAlert