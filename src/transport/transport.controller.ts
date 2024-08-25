import { Controller, Get, Request, Logger } from '@nestjs/common';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';
import { ScheduleDTO } from './dto/schedule.dto';



@Controller('/schedule')
export class TransportController {
    private readonly logger = new Logger(TransportController.name);

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile successfully retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSchedule(
    @Request() req,
  ): ScheduleDTO {
    this.logger.log(`getSchedule method hit`);

    const schedule: ScheduleDTO = {
      message: 'Schedule Information',
      cost: 9.0,
      from: [
        {
            city: 'Rawabi',
            days: [
                { day: 'Saturday', hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
                { day: 'Sunday', hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
                { day: 'Monday', hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
                { day: 'Tuesday', hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
                { day: 'Wednesday', hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
                { day: 'Thursday', hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
                { day: 'Friday', hours: [] }
            ]
    },
    {
        city: 'Ramallah',
        days: [
            { day: 'Saturday', hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
            { day: 'Sunday', hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
            { day: 'Monday', hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
            { day: 'Tuesday', hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
            { day: 'Wednesday', hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
            { day: 'Thursday', hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
            { day: 'Friday', hours: [] }
            ]
        }
      ]
    };
    return schedule;
  }
}
