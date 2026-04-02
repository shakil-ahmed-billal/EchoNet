import { Request, Response } from 'express';
import { StoryServices } from './story.service.js';

const getStories = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id;
    const data = await StoryServices.getStories(currentUserId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createStory = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id;
    const file = req.file;
    const data = await StoryServices.createStory(currentUserId, req.body, file);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteStory = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id;
    const id = req.params.id as string;
    const data = await StoryServices.deleteStory(id, currentUserId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const viewStory = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id;
    const id = req.params.id as string;
    const data = await StoryServices.viewStory(id, currentUserId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const reactToStory = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id;
    const id = req.params.id as string;
    const { type } = req.body;
    const data = await StoryServices.reactToStory(id, currentUserId, type);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const replyToStory = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id;
    const id = req.params.id as string;
    const { content } = req.body;
    const data = await StoryServices.replyToStory(id, currentUserId, content);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getStoryInsights = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id;
    const id = req.params.id as string;
    const data = await StoryServices.getStoryInsights(id, currentUserId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const StoryControllers = { getStories, createStory, deleteStory, viewStory, reactToStory, replyToStory, getStoryInsights };
