import { StoryAcceptanceTest } from "./storyAcceptanceTest";

export class Story{
  id: number;
  projectId: number;

  name: string = '';
  storyDescription: string = '';
  priority: string = '';
  businessValue: number;
  timeEstimate: number = 0;
  timeEstimateOriginal: number = 0;
  rejectReason: string;
  isConfirmed: boolean = false;

  sprint_id: number; //can be null
  isDone: boolean = false;

  acceptenceTests: StoryAcceptanceTest[] = [];
}