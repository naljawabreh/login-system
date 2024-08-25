import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsArray, ArrayNotEmpty, IsPositive } from 'class-validator';

export class WeekDayDTO {
    @ApiProperty({ example: 'Sunday', description: 'The name of the day' })
    @IsString()
    @IsNotEmpty()
    day: string;

    @ApiProperty({ example: ['09:00', '10:00', '13:00'], description: 'Array of hours for the given day' })
    @IsArray()
    @IsString({ each: true })
    hours: string[];
}

export class LocationDTO {
    @ApiProperty({ example: 'Rawabi', description: 'The name of the city' })
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty({ type: [WeekDayDTO], description: 'List of weekdays with hours' })
    @IsArray()
    @ArrayNotEmpty()
    days: WeekDayDTO[];
}

export class ScheduleDTO {
    @ApiProperty({ example: 'Schedule Information', description: 'The message to be returned' })
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiProperty({ example: 9.0, description: 'The cost associated with the schedule', type: 'number' })
    @IsNumber()
    @IsPositive()
    cost: number;

    @ApiProperty({ type: [LocationDTO], description: 'List of locations with schedules' })
    @IsArray()
    @ArrayNotEmpty()
    from: LocationDTO[];
}
