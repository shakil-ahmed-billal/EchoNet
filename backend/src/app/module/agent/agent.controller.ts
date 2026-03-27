import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { AgentServices } from './agent.service.js';

const getAgentProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await AgentServices.getAgentProfile(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Agent profile fetched successfully',
    data: result,
  });
});

const getAllAgents = catchAsync(async (req: Request, res: Response) => {
  const result = await AgentServices.getAllAgents(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Agents fetched successfully',
    data: result,
  });
});

const createAgentProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await AgentServices.createAgentProfile(userId, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Agent profile created and awaiting verification',
    data: result,
  });
});

const verifyAgent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await AgentServices.verifyAgent(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Agent verified successfully',
    data: result,
  });
});

export const AgentControllers = {
  getAgentProfile,
  getAllAgents,
  createAgentProfile,
  verifyAgent,
};
