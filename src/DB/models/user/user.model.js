import { model, Schema } from "mongoose";
import { SYS_GENDER, SYS_ROLE } from "../../../common/index.js";

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    provider: {
      type: String,
      enum: ["google", "system"],
      default: "system",
    },
    password: {
      type: String,
      required: function () {
        if (this.provider == "google") return false;
        else return true;
      },
    },
    phone: {
      type: String,
    },
    age: {
      type: Number,
      min: 18,
      max: 60,
    },
    gender: {
      type: Number,
      enum: Object.values(SYS_GENDER),
      default: SYS_GENDER.male,
    },
    role: {
      type: Number,
      enum: Object.values(SYS_ROLE),
      default: SYS_ROLE.user,
    },
    profilePic: String,
    coverPic: String,

    isEmailVerified: {
      type: Boolean,
      default: true,
    },
    credentialsUpdatedAt: {
      type: Date,
      default: Date.now(),
    },
    visitorCount: {
      type: Number,
      default: 0,
    },
    twoStepVer: {
      type: Boolean,
      default: false,
    },
    isLoggedOut: {
      type: Boolean,
      default: true,
    },
  },

  {
    versionKey: false,
  },
);

export const User = model("User", schema);
