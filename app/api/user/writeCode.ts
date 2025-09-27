import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { filename, code } = req.body;

    if (!filename || !code) {
      return res.status(400).json({ error: "filename and code are required" });
    }

    const filePath = path.join(process.cwd(), 'manimations', filename); // change folder as needed
    fs.writeFile(filePath, code, 'utf8', (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to write file' });
      }
      return res.status(200).json({ message: 'File saved successfully', path: filePath });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
