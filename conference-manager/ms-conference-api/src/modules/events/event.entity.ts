import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Headquarter } from '../headquarter/headquarter.entity'

export type EventDocument = HydratedDocument<Event>

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  eventDate!: Date

  @Prop({ required: true })
  tags!: string

  @Prop({ required: true, unique: true })
  name!: string

  @Prop({ required: true })
  year!: string

  @Prop({ required: true })
  type!: string

  @Prop({ required: true })
  owner!: string

  @Prop({ required: false })
  images?: [string]

  @Prop({ required: true, enum: ['active', 'inactive', 'created'] })
  status!: string

  @Prop({ required: true })
  address!: string

  @Prop({ required: true })
  description!: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Headquarter' })
  headquarter!: Headquarter

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] })
  attendees?: mongoose.Types.ObjectId[];
}

export const EventSchema = SchemaFactory.createForClass(Event)
