// Main config file. Mostly read the configuration from .env files
import Config from "react-native-config";

export const environment: string = Config.ENVIRONMENT;

// Default pin for dev mode
export const defaultPin = "162534";
