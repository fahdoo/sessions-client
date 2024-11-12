// pages/privacy.js
import React from 'react';
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const PrivacyPolicy = () => (
  <LegalPageLayout 
    title="Privacy Policy" 
    description="Read the Privacy Policy for Sessional.ai, currently in alpha phase."
  >
    <section>
      <h2 className="text-2xl font-semibold mb-6">1. Introduction</h2>
      <p className="leading-relaxed text-base">
        Sessional.ai is currently in an <strong>alpha phase</strong>. During this time, we may collect additional data 
        to improve the Service. This Privacy Policy explains how we collect, use, and protect the information you provide 
        when using our platform, Sessional.ai (the "Service"). By using the Service, you consent to the practices outlined in this Privacy Policy.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-6">2. Information We Collect</h2>
      <p className="mb-6">To improve the Service, we may collect and process the following types of data:</p>
      <ul className="list-disc pl-6 space-y-4">
        <li>
          <strong className="text-foreground">Personal Information:</strong>
          <span className="ml-2 text-base">Information that can identify you, such as your name, email address, or other contact details you provide when signing up.</span>
        </li>
        <li>
          <strong className="text-foreground">Session Data:</strong>
          <span className="ml-2 text-base">Information related to your interactions with our Service, including prompts, questions, responses, and user feedback.</span>
        </li>
        <li>
          <strong className="text-foreground">Usage Data:</strong>
          <span className="ml-2 text-base">Automatically collected data about how you interact with our Service, including IP address, browser type, and activity logs.</span>
        </li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-6">3. How We Use Your Information</h2>
      <p className="mb-6">We primarily use your information to enhance and optimize the Service, including:</p>
      <ul className="list-disc pl-6 space-y-4">
        <li>
          <strong className="text-foreground">Improvement of Prompts and User Experience:</strong>
          <span className="ml-2 text-base">To analyze user interactions and improve the quality and personalization of responses.</span>
        </li>
        <li>
          <strong className="text-foreground">Product Development:</strong>
          <span className="ml-2 text-base">Your data helps us iterate on features, refine our AI models, and develop new aspects of the Service.</span>
        </li>
        <li>
          <strong className="text-foreground">Communications:</strong>
          <span className="ml-2 text-base">We may use your contact information to send service updates or notifications related to the Service.</span>
        </li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-6">4. Sharing of Information</h2>
      <p className="mb-6">We handle your information with care and share it only in specific circumstances:</p>
      <ul className="list-disc pl-6 space-y-4">
        <li className="text-base">
          <strong className="text-foreground">No Sale of Personal Data:</strong>
          <span className="ml-2">We do not sell or rent your personal information to third parties.</span>
        </li>
        <li className="text-base">
          <strong className="text-foreground">Aggregated Data:</strong>
          <span className="ml-2">We may share anonymized, aggregated data with partners for the purpose of improving and scaling the Service.</span>
        </li>
        <li className="text-base">
          <strong className="text-foreground">Legal Requirements:</strong>
          <span className="ml-2">We may disclose information if required by law or to protect our rights and safety.</span>
        </li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-6">5. Data Security</h2>
      <p className="mb-6">We take several measures to protect your information:</p>
      <ul className="list-disc pl-6 space-y-4">
        <li className="text-base">
          <strong className="text-foreground">Security Measures:</strong>
          <span className="ml-2">We implement industry-standard security measures to protect your information.</span>
        </li>
        <li className="text-base">
          <strong className="text-foreground">Data Protection:</strong>
          <span className="ml-2">We use encryption and secure protocols to protect data transmission and storage.</span>
        </li>
        <li className="text-base">
          <strong className="text-foreground">Limited Access:</strong>
          <span className="ml-2">Access to personal information is restricted to authorized personnel only.</span>
        </li>
      </ul>
      <p className="mt-6 text-base">While no data transmission or storage system can be guaranteed 100% secure, we continuously work to protect your information through reasonable measures to prevent unauthorized access.</p>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-6">6. Your Choices</h2>
      <p className="mb-6">You have several rights regarding your personal information:</p>
      <ul className="list-disc pl-6 space-y-4">
        <li className="text-base">
          <strong className="text-foreground">Access:</strong>
          <span className="ml-2">You may request access to your personal information.</span>
        </li>
        <li className="text-base">
          <strong className="text-foreground">Update:</strong>
          <span className="ml-2">You can update or correct your personal information at any time.</span>
        </li>
        <li className="text-base">
          <strong className="text-foreground">Deletion:</strong>
          <span className="ml-2">You may request deletion of your personal information, subject to legal requirements.</span>
        </li>
      </ul>
      <p className="mt-6 text-base">Please note that some data may be retained for legitimate business or legal purposes, even after a deletion request.</p>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-6">7. Changes to This Privacy Policy</h2>
      <p className="mb-6">Our privacy practices may change over time:</p>
      <ul className="list-disc pl-6 space-y-4">
        <li className="text-base">
          <strong className="text-foreground">Updates:</strong>
          <span className="ml-2">As we improve our Service, we may update this Privacy Policy.</span>
        </li>
        <li className="text-base">
          <strong className="text-foreground">Notifications:</strong>
          <span className="ml-2">We will notify users of significant changes by posting the updated policy on our website.</span>
        </li>
        <li className="text-base">
          <strong className="text-foreground">Effective Date:</strong>
          <span className="ml-2">The "Effective Date" at the top of this policy will be updated to reflect any changes.</span>
        </li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-6">8. Contact Us</h2>
      <p className="mb-6">If you have any questions or concerns about this Privacy Policy:</p>
      <ul className="list-disc pl-6 space-y-4">
        <li className="text-base">
          <strong className="text-foreground">Email:</strong>
          <span className="ml-2">Contact us at hello@sessional.ai</span>
        </li>
        <li className="text-base">
          <strong className="text-foreground">Response Time:</strong>
          <span className="ml-2">We strive to respond to all privacy-related inquiries within 48 hours.</span>
        </li>
      </ul>
    </section>
  </LegalPageLayout>
);

export default PrivacyPolicy;
