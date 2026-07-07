import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

router.get("/google/maps-embed", (req: Request, res: Response) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "Maps not configured" });
    return;
  }
  const place = String(req.query.q ?? "Grays Park Masjid, Grays, Essex, UK");
  const url = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(place)}&zoom=16`;
  res.redirect(302, url);
});

export default router;
