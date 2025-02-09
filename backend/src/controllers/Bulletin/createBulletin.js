import { Bulletin } from "../../models/bulletin.models.js";

const createBulletin = async (req, res) => {
  try {
    const { title, type, content, priority } = req.body;

    const newBulletin = new Bulletin({
        title,
        type,
        content,
        priority
    });

    await newBulletin.save();

    return res.status(201).json({ message: "Bulletin created successfully.", newBulletin });
  } catch (error) {
    console.error('Error creating bulletin:', error);
    return res.status(500).json({ message: "Error creating bulletin.", error: error.message });
  }
}

export default createBulletin