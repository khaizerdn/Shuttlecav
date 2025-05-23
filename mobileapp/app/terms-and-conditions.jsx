import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import globalStyles from './globalstyles';

const TermsAndConditions = () => {
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#FFF',
        alignItems: 'flex-start',
      }}
      showsVerticalScrollIndicator={true}
      alwaysBounceVertical={true}
    >
      <Text style={styles.title}>Shuttlecav Terms and Conditions</Text>
      <Text style={styles.lastUpdated}>Last Updated: May 17, 2025</Text>
      
      <Text style={styles.paragraph}>
        Welcome to Shuttlecav, an NFC-based shuttle services management system provided by the Carmona Estates Homeowners Transport Multipurpose Cooperative ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of the Shuttlecav mobile application ("App") and related services, including the credit-loading kiosk and shuttle management features. By accessing or using the App, you agree to be bound by these Terms. If you do not agree, please refrain from using the App.
      </Text>

      <Text style={styles.section}>1. Use of the App</Text>
      <Text style={styles.subsection}>1.1. Eligibility</Text>
      <Text style={styles.paragraph}>
        You must be at least 13 years old to use the App, unless otherwise specified by local regulations or with parental consent where applicable. By using the App, you confirm that you meet this requirement.
      </Text>
      <Text style={styles.subsection}>1.2. Account Registration</Text>
      <Text style={styles.paragraph}>
        To access certain features, such as fare payments or credit loading, you must register an account. You agree to provide accurate, current, and complete information during registration and to update it as necessary.
      </Text>
      <Text style={styles.subsection}>1.3. Account Security</Text>
      <Text style={styles.paragraph}>
        You are responsible for safeguarding your account credentials and NFC card. Notify us immediately at facebook.com/CEHTMPCCoop if you suspect unauthorized use of your account or card. We are not liable for losses resulting from your failure to protect your credentials.
      </Text>

      <Text style={styles.section}>2. Services Provided</Text>
      <Text style={styles.subsection}>2.1. Shuttle Services Management</Text>
      <Text style={styles.paragraph}>
        The App enables you to:
        {"\n"}- Track shuttle operations (e.g., driver details, plate number, passenger counts, arrival/departure times, and locations).
        {"\n"}- Pay fares using NFC cards.
        {"\n"}- Load credits onto NFC cards via the designated kiosk.
      </Text>
      <Text style={styles.subsection}>2.2. Geographic Scope</Text>
      <Text style={styles.paragraph}>
        The App is intended for use within the Carmona Estates community in Carmona City, Cavite. Services may not be available or supported outside this area.
      </Text>
      <Text style={styles.subsection}>2.3. Data Collection</Text>
      <Text style={styles.paragraph}>
        We collect data such as your name, NFC card details, transaction history, and location information to provide these services. See our Privacy Policy for details.
      </Text>

      <Text style={styles.section}>3. Payments and Fees</Text>
      <Text style={styles.subsection}>3.1. Payment Processing</Text>
      <Text style={styles.paragraph}>
        Fares are processed via NFC cards at designated points. You agree to maintain sufficient credits on your card to cover shuttle fares.
      </Text>
      <Text style={styles.subsection}>3.2. Credit Loading</Text>
      <Text style={styles.paragraph}>
        Credits can be loaded onto your NFC card at the cooperative's kiosk. All transactions are final once confirmed, subject to the refund policy below.
      </Text>
      <Text style={styles.subsection}>3.3. Refund Policy</Text>
      <Text style={styles.paragraph}>
        Refunds for unused credits are not provided unless required by law or approved by the cooperative under exceptional circumstances (e.g., system errors). Contact us at facebook.com/CEHTMPCCoop for refund requests.
      </Text>
      <Text style={styles.subsection}>3.4. Liability</Text>
      <Text style={styles.paragraph}>
        You are responsible for securing your NFC card. We are not liable for losses due to lost, stolen, or misused cards, provided we have not caused the issue through negligence.
      </Text>

      <Text style={styles.section}>4. User Conduct</Text>
      <Text style={styles.subsection}>4.1. Acceptable Use</Text>
      <Text style={styles.paragraph}>
        Use the App solely for its intended purpose—managing shuttle services within Carmona Estates. Unlawful, fraudulent, or harmful activities are prohibited.
      </Text>
      <Text style={styles.subsection}>4.2. Prohibited Activities</Text>
      <Text style={styles.paragraph}>
        You may not:
        {"\n"}- Attempt to hack, disrupt, or gain unauthorized access to the App or its systems.
        {"\n"}- Use the App to transmit malicious code or interfere with its functionality.
        {"\n"}- Misuse your NFC card or engage in fraudulent payment practices.
      </Text>

      <Text style={styles.section}>5. Intellectual Property</Text>
      <Text style={styles.subsection}>5.1. Ownership</Text>
      <Text style={styles.paragraph}>
        The App, its branding, logos, and underlying technology (e.g., NFC integration, web API) are owned by the Carmona Estates Homeowners Transport Multipurpose Cooperative or its licensors and are protected by intellectual property laws.
      </Text>
      <Text style={styles.subsection}>5.2. License</Text>
      <Text style={styles.paragraph}>
        We grant you a limited, non-exclusive, non-transferable license to use the App for personal, non-commercial purposes within the scope of these Terms. Copying, modifying, or distributing the App without permission is prohibited.
      </Text>

      <Text style={styles.section}>6. Privacy</Text>
      <Text style={styles.subsection}>6.1. Data Collection</Text>
      <Text style={styles.paragraph}>
        We collect and process personal data (e.g., name, NFC card ID, location, transaction details) to operate the shuttle services, process payments, and generate reports. Refer to our Privacy Policy for more information.
      </Text>
      <Text style={styles.subsection}>6.2. Data Security</Text>
      <Text style={styles.paragraph}>
        We implement reasonable measures to protect your data but cannot guarantee absolute security. You acknowledge the risks inherent in digital systems.
      </Text>
      <Text style={styles.subsection}>6.3. Data Sharing</Text>
      <Text style={styles.paragraph}>
        Data may be shared with third parties (e.g., payment processors, database hosts) as necessary to provide the services. We will not share your data for marketing purposes without your consent.
      </Text>

      <Text style={styles.section}>7. Termination</Text>
      <Text style={styles.subsection}>7.1. Termination by Us</Text>
      <Text style={styles.paragraph}>
        We may suspend or terminate your account and access to the App without notice if you violate these Terms, misuse the system, or engage in conduct harmful to us, other users, or third parties.
      </Text>
      <Text style={styles.subsection}>7.2. Termination by You</Text>
      <Text style={styles.paragraph}>
        You may terminate your account by contacting us at [insert contact email] or following in-App instructions, if available.
      </Text>

      <Text style={styles.section}>8. Dispute Resolution</Text>
      <Text style={styles.subsection}>8.1. Governing Law</Text>
      <Text style={styles.paragraph}>
        These Terms are governed by the laws of the Republic of the Philippines.
      </Text>
      <Text style={styles.subsection}>8.2. Arbitration</Text>
      <Text style={styles.paragraph}>
        Disputes arising from these Terms or your use of the App will be resolved through binding arbitration under the rules of the Philippine Dispute Resolution Center, unless otherwise required by law. Arbitration will occur in Carmona City, Cavite.
      </Text>

      <Text style={styles.section}>9. Limitation of Liability</Text>
      <Text style={styles.paragraph}>
        We are not liable for indirect, incidental, or consequential damages arising from your use of the App, including but not limited to lost credits, service interruptions, or data breaches, except where liability cannot be limited by law.
      </Text>

      <Text style={styles.section}>10. Miscellaneous</Text>
      <Text style={styles.subsection}>10.1. Entire Agreement</Text>
      <Text style={styles.paragraph}>
        These Terms represent the full agreement between you and us regarding the App's use.
      </Text>
      <Text style={styles.subsection}>10.2. Amendments</Text>
      <Text style={styles.paragraph}>
        We may update these Terms periodically. Changes will be posted in the App, and your continued use constitutes acceptance of the revised Terms.
      </Text>
      <Text style={styles.subsection}>10.3. Contact Information</Text>
      <Text style={styles.paragraph}>
        For questions or support, contact us at:
        {"\n"}- Facebook page: facebook.com/CEHTMPCCoop
        {"\n"}- Address: Carmona Estates Homeowners Transport Multipurpose Cooperative, Carmona City, Cavite
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
  },
  lastUpdated: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'left',
  },
  section: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  subsection: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
});

export default TermsAndConditions;