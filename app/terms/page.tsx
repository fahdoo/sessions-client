// pages/terms.js
import React from 'react';
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

const Terms = () => (
  <LegalPageLayout 
    title="Terms of Service" 
    description="Read the Terms of Service for Sessional.ai, currently in alpha phase."
  >
    <section>
      <h2 className="text-2xl font-semibold mb-6">1. Acceptance of Terms</h2>
      <p className="leading-relaxed text-base">
        Sessional.ai is currently in an <strong>alpha phase</strong>, meaning the platform is under active development. 
        Features may change, be incomplete, or contain bugs. By accessing or using Sessional.ai ("the Service"), 
        you agree to comply with and be bound by these Terms of Service ("Terms"). If you do not agree, please do not use the Service.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-6">2. Description of Service</h2>
      <p className="leading-relaxed text-base">
        Sessional.ai provides an AI-powered platform designed to offer insights and personalized recommendations 
        through interactive sessions. These Terms apply to all users and cover the access and use of the Service.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-6">3. User Content and Data Usage</h2>
      <p className="leading-relaxed text-base">
        During this alpha phase, you agree that any content you provide, including prompts, feedback, and interactions, 
        may be used by Sessional.ai to improve the Service. By providing content, you grant us a non-exclusive, royalty-free, 
        worldwide license to use, modify, and analyze this data to enhance our offerings.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-6">4. Modifications to the Service</h2>
      <p className="leading-relaxed text-base">
        Sessional.ai reserves the right to modify, update, or discontinue any aspect of the Service at any time. 
        We will strive to notify users of significant changes, but may not always provide advance notice due to the evolving nature of this alpha release.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-6">5. User Responsibilities</h2>
      <p className="mb-6">By using the Service, you agree not to:</p>
      <ul className="list-disc pl-6 space-y-4">
        <li className="text-base">Misuse the Service in any way that could interfere with its functionality.</li>
        <li className="text-base">Use the Service for illegal or unauthorized purposes.</li>
        <li className="text-base">Attempt to decompile, reverse-engineer, or tamper with the Service's code or data.</li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-6">6. Disclaimer of Warranties</h2>
      <p className="leading-relaxed text-base">
        The Service is provided "as is" and "as available." Sessional.ai disclaims all warranties, express or implied, 
        regarding the Service, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-6">7. Limitation of Liability</h2>
      <p className="leading-relaxed text-base">
        Sessional.ai is provided on an "as is" and "as available" basis during this alpha phase. 
        You acknowledge that, as an alpha product, the Service may contain bugs, experience outages, and undergo significant changes. 
        Sessional.ai disclaims any liability for potential data loss, errors, or interruptions associated with this early release version.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-6">8. Indemnification</h2>
      <p className="leading-relaxed text-base">
        You agree to indemnify and hold Sessional.ai, its affiliates, and employees harmless from any claims, losses, 
        damages, or expenses arising from your use of the Service or violation of these Terms.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-6">9. Governing Law</h2>
      <p className="leading-relaxed text-base">
        These Terms are governed by and construed in accordance with the laws of the State of California, United States of America. 
        Any disputes arising from or related to the use of the Service shall be resolved in the courts of California, United States of America. 
        If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the 
        minimum extent necessary so that these Terms shall otherwise remain in full force and effect and enforceable.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-6">10. Changes to Terms of Service</h2>
      <p className="leading-relaxed text-base">
        Sessional.ai reserves the right to modify these Terms at any time. We will provide notice of changes by 
        posting the updated Terms on our website. Your continued use of the Service signifies your acceptance of the revised Terms.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-semibold mb-6">11. Contact Us</h2>
      <p className="leading-relaxed text-base">If you have any questions or concerns about these Terms, please contact us at hello@sessional.ai.</p>
    </section>
  </LegalPageLayout>
);

export default Terms;
