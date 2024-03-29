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

  sprint_id: number; //can be null
  isDone: boolean = false;
  isConfirmed: boolean = false;

  acceptenceTests: StoryAcceptanceTest[] = [];
}