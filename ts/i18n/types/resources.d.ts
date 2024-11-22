interface Resources {
  global: {
    tabNavigator: {
      wallet: 'Wallet';
      scanQr: 'Scan QR';
      showQr: 'Show QR';
    };
    buttons: {
      next: 'Next';
      skip: 'Skip';
      start: 'Start';
      close: 'Close';
      delete: 'Delete';
      continue: 'Continue';
      activate: 'Activate';
      notNow: 'Not now';
      back: 'Back';
    };
    errors: {
      generic: {
        title: "There's an issue with our systems";
        body: 'Please try again in a few minutes.';
      };
    };
  };
  onboarding: {
    carousel: {
      first: {
        title: 'Welcome to the Wallet app!';
        content: 'Discover what you can do';
      };
      second: {
        title: 'Add your documents';
        content: 'Securely save and store digital versions of your documents';
      };
      third: {
        title: 'Authenticate with Wallet';
        content: 'Use this app to present your documents and access online services';
      };
    };
    start: {
      title: 'Start with Wallet';
      subtitle: 'Store your documents securely.';
    };
    pin: {
      title: 'Create an unlock code';
      subTitle: 'This is the 6-digit code to access and authorize certain operations in the app.';
      confirmation: {
        title: 'Confirm unlock code';
      };
      policy: {
        title: 'How to choose the code?';
        description: 'The unlock code is made up of 6 digits and will be used to access and authorize certain operations in the app.';
        bulletList: {
          title: 'Choose a code that is hard to guess and does not contain:';
          firstItem: 'a single repeated number (e.g. 000000);';
          secondItem: 'a sequence of ordered numbers (e.g. 123456 or 654321).';
        };
      };
      errors: {
        invalid: {
          title: 'Too easy!';
          description: 'Choose a code that is hard to guess, which does not contain a single repeated number (e.g. 000000) or a sequence of ordered numbers (e.g. 123456 or 654321).';
          cta: 'Choose another code';
        };
        match: {
          title: 'The code you enter is different than the first one';
          cta: 'Try again';
        };
      };
    };
    biometric: {
      title: 'Enable biometric recognition';
      notEnrolled: {
        description: "You can use your face or fingerprint instead of the unlock code. This will allow you to access the app and authorize operations more quickly and securely. \n \n To do this, you first need to configure it in your device's system settings.";
        list: {
          header: 'How to do it';
          firstItem: {
            label: 'Step 1';
            value: "Go to your device's settings";
          };
          secondItem: {
            label: 'Step 2';
            value: 'Configure the face or fingerpint';
          };
          thirdItem: {
            label: 'Step 3';
            value: 'Enable it in Wallet under Profile > Security';
          };
        };
      };
      noLockScreen: {
        title: 'Protect your device';
        subtitle: 'Wallet sends you communications that concern you personally. Make sure that only you can access the application by setting a code or pattern to unlock the device.';
        list: {
          header: 'How to do it';
          firstItem: {
            label: 'Step 1';
            value: "Go to your device's settings";
          };
          secondItem: {
            label: 'Step 2';
            value: 'Set a code or sign to unlock the device';
          };
        };
      };
      available: {
        title: 'Enable biometric recognition';
        settings: 'You can always change your choice in Profile > Security';
        body: 'You can use your face or fingerprint instead of the unlock code. This will allow you to access the app and authorize operations more quickly and securely.';
      };
      popup: {
        sensorDescription: 'Login quickly';
      };
    };
  };
  wallet: {
    activationBanner: {
      title: 'Your digital documents always with you!';
      description: 'Activate the Wallet to keep your digital identity and personal documents on your device.';
      action: 'Start';
    };
    discovery: {
      title: 'Your digital documents at your fingertips';
      description: "###### How it works \n Wallet allows you to save and keep on your device the digital version of your Identity and some of the physical documents you already own.  \n\n ###### It's easy and fast \n You can authenticate yourself in Italy and abroad for many digital services, or verify your credentials in person by showing the QR code linked to the digital versions of your documents.";
    };
  };
}

export default Resources;
