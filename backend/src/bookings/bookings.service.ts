import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  findAll(date?: string) {
    return this.prisma.booking.findMany({
      where: date
        ? {
            startTime: { lte: new Date(`${date}T23:59:59`) },
            endTime: { gte: new Date(`${date}T00:00:00`) },
          }
        : undefined,
      orderBy: { startTime: 'asc' },
    });
  }

  async create(dto: CreateBookingDto, user: User) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (end <= start) {
      throw new BadRequestException('End time must be after start time');
    }
    if (start < new Date()) {
      throw new BadRequestException('Cannot book a slot in the past');
    }

    // Overlap check: existing.start < newEnd AND existing.end > newStart
    const overlapping = await this.prisma.booking.findFirst({
      where: {
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (overlapping) {
      throw new ConflictException(
        `This time slot is already booked from ${overlapping.startTime.toLocaleTimeString()} to ${overlapping.endTime.toLocaleTimeString()}`,
      );
    }

    return this.prisma.booking.create({
      data: {
        companyName: user.companyName,
        userId: user.id,
        startTime: start,
        endTime: end,
      },
    });
  }

  async remove(id: string, user: User) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== user.id) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }
    await this.prisma.booking.delete({ where: { id } });
    return { success: true };
  }
}
