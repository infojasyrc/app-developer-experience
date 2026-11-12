import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true })
export class User {
  @ApiProperty()
  _id!: string

  @ApiProperty({ description: 'Firebase auth uid' })
  @Prop({ required: true, unique: true })
  uid!: string

  @ApiProperty({ description: 'User first name' })
  @Prop({ required: true })
  firstName!: string

  @ApiProperty({ description: 'User last name' })
  @Prop({ required: true })
  lastName!: string

  @ApiProperty({ description: 'User email address' })
  @Prop({ required: true, unique: true })
  email!: string

  @ApiProperty({ description: 'Whether the user has admin privileges' })
  @Prop({ required: true, default: false })
  isAdmin!: boolean

  @ApiProperty({ description: 'Whether the user has super-admin privileges' })
  @Prop({ required: true, default: false })
  isSuperAdmin!: boolean

  @Prop({ required: true })
  createdBy!: string

  @Prop({ required: false })
  updatedBy?: string

  // Managed by Mongoose timestamps: true — do not add @Prop
  readonly createdAt!: Date
  readonly updatedAt!: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
