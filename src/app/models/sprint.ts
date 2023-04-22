export class Sprint{
  id: number;
  startDate: Date;
  endDate: Date;
  velocity: number; //float
  projectId: number;

  //frontend only
  status: string; //enum: 'Active', 'Finished'
  velocityFilled: number = 0;
}

// <label for="startDate">Start</label>
// <input id="startDate" class="form-control" type="date" />