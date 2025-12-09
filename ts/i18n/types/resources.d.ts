interface Resources {
  "global": {
    "generics": {
      "waiting": "Wait few seconds",
      "success": "Success",
      "error": {
        "title": "C'è un problema sui nostri sistemi",
        "body": "Riprova tra qualche minuto. Se si ripete, contatta l'assistenza."
      },
      "alert": {
        "title": "Vuoi interrompere l'operazione?",
        "body": "Dovrai ripetere di nuovo tutti i passaggi",
        "confirm": "Sì, interrompi",
        "cancel": "No, riprendi"
      }
    },
    "tabNavigator": {
      "wallet": "Wallet",
      "scanQr": "Scan QR",
      "showQr": "Show QR"
    },
    "settings": {
      "title": "Settings",
      "reset": {
        "title": "Reset App",
        "walletReset": "Reset wallet",
        "onboardingReset": "Reset onboarding"
      },
      "debug": "Enable debug mode",
      "version": "Version"
    },
    "buttons": {
      "next": "Next",
      "skip": "Skip",
      "start": "Start",
      "close": "Close",
      "delete": "Delete",
      "continue": "Continue",
      "activate": "Activate",
      "notNow": "Not now",
      "back": "Back",
      "cancel": "Cancel",
      "confirm": "Confirm",
      "help": "Help",
      "done": "Done",
      "show": "Show"
    },
    "loading": {
      "body": "Please wait a moment"
    },
    "accessibility": {
      "activityIndicator": {
        "label": "Loading",
        "hint": "Wait for the content load"
      }
    },
    "clipboard": {
      "copyFeedback": "Copied to clipboard"
    },
    "identification": {
      "title": {
        "validation": "Authorise the operation.",
        "access": "Hi!"
      },
      "forgot": {
        "title": "Did you forget the the unlock code?",
        "confirmTitle": "Did you forget the unlock code?",
        "confirmMsg": "To be able to choose a new unlock code you will need to log in again.",
        "confirmMsgWithTask": "To be able to choose a new unlock code you will need to cancel the current procedure and log in again."
      },
      "error": {
        "deviceLocked": "Authentication was not successful, the device currently in a lockout of 30 seconds",
        "DeviceLockedPermanent": "Authentication was not successful, device must be unlocked via password"
      },
      "unlockCode": {
        "accessibility": {
          "fingerprint": "Login with your fingerprint",
          "faceId": "Login with the Face ID"
        }
      },
      "biometric": {
        "title": "Biometric identification",
        "sensorDescription": "Login quickly"
      }
    },
    "errors": {
      "generic": "An error occurred"
    },
    "cancelOperation": {
      "title": "Do you want to stop the operation?",
      "confirm": "Yes, stop",
      "cancel": "No, continue"
    }
  },
  "onboarding": {
    "carousel": {
      "first": {
        "title": "Welcome to the Wallet app!",
        "content": "Discover what you can do"
      },
      "second": {
        "title": "Add your documents",
        "content": "Securely save and store digital versions of your documents"
      },
      "third": {
        "title": "Authenticate with Wallet",
        "content": "Use this app to present your documents and access online services"
      }
    },
    "start": {
      "title": "Start with Wallet",
      "subtitle": "Store your documents securely."
    },
    "pin": {
      "title": "Create an unlock code",
      "subTitle": "This is the 6-digit code to access and authorize certain operations in the app.",
      "confirmation": {
        "title": "Confirm unlock code"
      },
      "policy": {
        "title": "How to choose the code?",
        "description": "The unlock code is made up of 6 digits and will be used to access and authorize certain operations in the app. \n\n Choose a code that is hard to guess and does not contain: \n - a single repeated number (e.g. 000000); \n - a sequence of ordered numbers (e.g. 123456 or 654321)."
      },
      "errors": {
        "invalid": {
          "title": "Too easy!",
          "description": "Choose a code that is hard to guess, which does not contain a single repeated number (e.g. 000000) or a sequence of ordered numbers (e.g. 123456 or 654321).",
          "cta": "Choose another code"
        },
        "match": {
          "title": "The code you enter is different than the first one",
          "cta": "Try again"
        }
      }
    },
    "biometric": {
      "title": "Enable biometric recognition",
      "notEnrolled": {
        "description": "You can use your face or fingerprint instead of the unlock code. This will allow you to access the app and authorize operations more quickly and securely. \n \n To do this, you first need to configure it in your device's system settings.",
        "list": {
          "header": "How to do it",
          "firstItem": {
            "label": "Step 1",
            "value": "Go to your device's settings"
          },
          "secondItem": {
            "label": "Step 2",
            "value": "Configure the face or fingerpint"
          },
          "thirdItem": {
            "label": "Step 3",
            "value": "Enable it in Wallet under Profile > Security"
          }
        }
      },
      "noLockScreen": {
        "title": "Protect your device",
        "subtitle": "Wallet sends you communications that concern you personally. Make sure that only you can access the application by setting a code or pattern to unlock the device.",
        "list": {
          "header": "How to do it",
          "firstItem": {
            "label": "Step 1",
            "value": "Go to your device's settings"
          },
          "secondItem": {
            "label": "Step 2",
            "value": "Set a code or sign to unlock the device"
          }
        }
      },
      "available": {
        "title": "Enable biometric recognition",
        "settings": "You can always change your choice in Profile > Security",
        "body": "You can use your face or fingerprint instead of the unlock code. This will allow you to access the app and authorize operations more quickly and securely."
      },
      "popup": {
        "sensorDescription": "Login quickly"
      }
    }
  },
  "qrcodeScan": {
    "error": "Unrecognized QR code",
    "flash": "Flash",
    "tabs": {
      "scan": "Scan",
      "upload": "Upload"
    },
    "upload": {
      "image": "Upload an image",
      "file": "Upload a file"
    },
    "permissions": {
      "undefined": {
        "title": "We need your permission to access the camera",
        "label": "Allow access to the camera to scan QR codes",
        "action": "Allow access"
      },
      "denied": {
        "title": "You denied access to the camera",
        "label": "To allow access to the camera, go to the settings of your device",
        "action": "Open settings"
      }
    },
    "imagePicker": {
      "settingsAlert": {
        "title": "It seems access to Photos has been denied",
        "message": "We need access to your gallery in addition to upload QR codes",
        "buttonText": {
          "enable": "Enable permissions"
        }
      }
    },
    "multipleResultsAlert": {
      "title": "Hai inquadrato più codici",
      "body": "Inquadra un solo codice alla volta",
      "action": "Riprova"
    }
  },
  "wallet": {
    "credentials": {
      "names": {
        "mdl": "Driving License",
        "pid": "Digital Identity",
        "hiid": "Health ID",
        "fbk": "FBK Digital Badge",
        "disabilityCard": "Disability Card",
        "unknown": "Unknown"
      },
      "details": {
        "fbk": "You can use your FBK digital badge to enter different office locations, and access enterprise mobile and web-based services."
      }
    },
    "activationBanner": {
      "title": "Your digital documents always with you!",
      "description": "Activate the Wallet to keep your digital identity and personal documents on your device.",
      "action": "Start"
    },
    "discovery": {
      "screen": {
        "itw": {
          "title": "IO è il tuo portafoglio digitale di Stato: pubblico, sicuro, gratuito.",
          "features": {
            "1": "Usi la tua Patente su IO come documento di riconoscimento",
            "2": "Ti basta il tuo telefono per dimostrare la tua identità",
            "3": "Hai tutto ciò che ti serve anche se lasci a casa il portafoglio",
            "4": "I nuovi documenti digitali ufficiali, solo sull’app IO",
            "5": "Accedi in pochi tocchi ai servizi digitali della PA"
          },
          "details": {
            "1": {
              "title": "Facile, sicuro, ufficiale",
              "content": "Ottienilo con la tua **Carta di Identità Elettronica (CIE)** per associarlo alla tua identità.\n\nIl portafoglio IT-Wallet di IO usa sistemi di sicurezza avanzati per proteggere i tuoi dati e mantenerli al sicuro."
            },
            "2": {
              "title": "Nuovi documenti in arrivo",
              "content": "Titoli di studio, attestato di residenza e altri: potrai aggiungere all’app IO nuovi documenti ufficiali."
            },
            "3": {
              "title": "Tutto nelle tue mani",
              "content": "Mostri il codice QR della tua Patente digitale: chi verifica non dovrà tenere in mano il tuo dispositivo."
            },
            "4": {
              "title": "Progettato con l’Europa",
              "content": "IT-Wallet si integrerà al Portafoglio Digitale Europeo: potrai usare i tuoi documenti con pieno valore legale in tutta Europa."
            }
          },
          "tos": "Premendo **Continua** dichiari di aver letto e compreso l'Informativa Privacy e i Termini e Condizioni d'uso.",
          "actions": {
            "primary": "Continua",
            "anchor": "Scopri tutti i vantaggi"
          },
          "dismissalDialog": {
            "title": "Vuoi rinunciare ai vantaggi di IT-Wallet?",
            "body": "Potrai ottenere IT-Wallet in qualsiasi altro momento, se cambi idea.",
            "confirm": "Si, rinuncia",
            "cancel": "No, continua"
          }
        }
      }
    },
    "identification": {
      "modeSelection": {
        "section": {
          "issuance": "Ottieni IT-Wallet"
        },
        "title": {
          "issuance": "Conferma la tua identità"
        },
        "description": {
          "issuance": "È un passaggio di sicurezza necessario per associare i documenti digitali alla tua identità. "
        },
        "noCieCta": "Non hai la Carta di Identità Elettronica?",
        "mode": {
          "ciePin": {
            "title": "Continua con CIE + PIN",
            "subtitle": "Ha una durata di 12 mesi",
            "badge": "scelta consigliata"
          },
          "cieId": {
            "title": "Continua con l’app CieID",
            "subtitle": {
              "default": "Dovrai usare credenziali e app CieID"
            }
          }
        }
      }
    },
    "pidIssuance": {
      "preview": {
        "title": "Digital Idenitity:",
        "subtitle": "Here's a preview of your data",
        "button": "Add to Wallet"
      },
      "success": {
        "title": "It's all ready!",
        "subtitle": "You can now add your documents and access online services.",
        "buttons": {
          "add": "Add your first document",
          "later": "Later"
        }
      },
      "failure": {
        "title": "An unexpected error occurred",
        "subtitle": "Your request to the issuing entity was not successful.",
        "button": "I understand"
      }
    },
    "presentation": {
      "credentialNotFound": {
        "title": "Aggiungi il documento al Portafoglio",
        "subtitle": "Per usare i documenti su IO, prima aggiungili al Portafoglio. È facile e veloce."
      },
      "credentialDetails": {
        "footer": {
          "removal": {
            "remove": "Remove from wallet",
            "dialog": {
              "title": "Do you want to remove the document from the wallet?",
              "content": "If you change your mind, you can add it again later.",
              "confirm": "Yes, remove"
            }
          }
        }
      },
      "loading": {
        "title": "We are doing some security checks",
        "subtitle": "Wait few seconds"
      },
      "trust": {
        "title": "Allow your data to be read",
        "subtitle": "They will be shared to access to services.",
        "requiredClaims": "Required data",
        "optionalClaims": "Optional data",
        "disclaimer": {
          "0": "Your data is safe and will be processed only for the purposes described in the Privacy Policy.",
          "1": "The data will be shared only for the time necessary to issue the credential."
        }
      },
      "success": {
        "title": "Done!",
        "subtitle": "Continue on the partner site"
      },
      "successWithRedirect": {
        "title": "Done!",
        "subtitle": "You will be redirected to the partner site"
      }
    },
    "proximity": {
      "showQr": {
        "title": "Show QR",
        "body": "Display the QR code to verify the validity of the documents in your Wallet."
      },
      "connected": {
        "body": "Verification in progress. Please wait a few seconds..."
      },
      "disconnected": {
        "title": "Disconnection",
        "body": "The device has been disconnected. Please check the verifier app for more details."
      },
      "log": "Debug log",
      "isAuthenticated": {
        "true": "The verifier is authenticated",
        "false": "The verifier is not authenticated"
      },
      "success": {
        "title": "Done!",
        "subtitle": "The verification has been successfully completed.",
        "button": "Ok"
      },
      "failure": {
        "title": "An error has occurred",
        "subtitle": "Your data has been sent, but there has been an error. Check the verifier app for more information.",
        "subtitleFatal": "We were unable to complete the verification of your document.",
        "retry": "Try again",
        "understand": "I understand",
        "close": "Close"
      }
    },
    "claims": {
      "providedBy": "Provided by {{credential}}",
      "generic": {
        "notAvailable": "Claim not available",
        "expiryDate": "Valid until",
        "issueDate": "Valid from",
        "category": "Category",
        "valid": "VALID",
        "expired": "EXPIRED"
      },
      "mdl": {
        "license": "License {{category}}",
        "verificationEvidence": {
          "organizationId": "Organization ID",
          "organizationName": "Organization Name",
          "countryCode": "Country Code"
        }
      }
    },
    "home": {
      "addCredential": "Add document",
      "badges": {
        "saved": "Saved"
      }
    },
    "credentialIssuance": {
      "badges": {
        "saved": "Saved"
      },
      "addcredential": {
        "homebuttonlabel": "Add Document",
        "choosecredentialtoadd": {
          "title": "What would you like to add to the Wallet?",
          "headers": {
            "documents": "Documents"
          }
        }
      },
      "list": {
        "title": "What would you like to add to the Wallet?",
        "header": "Documents"
      },
      "trust": {
        "title": "{{credential}}: Required Data",
        "subtitle": "The data will be shared for the issuance of the digital version of the document.",
        "requiredData": "Required data",
        "disclaimer": {
          "store": "Your data is secure and will only be processed for the purposes described in the Privacy Notice.",
          "retention": "The data will only be shared for the time necessary to issue the digital version of the document."
        },
        "dataSource": "Provided by {{source}}"
      },
      "failure": {
        "title": "An unexpected error occurred",
        "subtitle": "Your request to the issuing entity was not successful.",
        "button": "I understand"
      }
    }
  }
}

export default Resources;
