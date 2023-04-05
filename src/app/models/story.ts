import { StoryAcceptanceTest } from "./storyAcceptanceTest";

export class Story{
  id: number;
  projectId: number;

  name: string = '';
  storyDescription: string = '';
  priority: string = '';
  businessValue: number;
  timeEstimate: number;

  sprint_id: number; //can be null
  isDone: boolean = false;

  acceptanceTests: StoryAcceptanceTest[] = [];
}