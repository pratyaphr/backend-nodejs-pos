import { generatePDF } from "../services/pdf.service.js";

export const getPDF = async (req, res) => {
  try {
    const { html } = req.body;

    const pdf = await generatePDF(html);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=receipt.pdf",
    });

    res.send(pdf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
