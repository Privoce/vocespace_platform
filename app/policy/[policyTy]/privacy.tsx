"use client";

const md = `
# Privacy Policy

Please read this Privacy Policy ("Policy") carefully before using the VoceSpace website and app (the "Service") operated by Privoce, Inc. ("Privoce", "us", "we", or "our").

This page is used to inform website visitors regarding our policies with the collection, use, and disclosure of Personal Information for anyone using to use our Service.

If you choose to use our Service, then you agree to the collection and use of information in relation with this policy. The Personal Information that we collect is used for providing and improving the Service. We will not use or share your information with anyone except as described in this Privacy Policy.

The terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, unless otherwise defined in this Privacy Policy.

## [Information Collection and Use](#information-collection)

For a better experience while using our Service, we may require you to provide us with certain personally identifiable information, including but not limited to your name and email address. The information that we collect will be used to contact you with updates to our service. You can change your email address or unsubscribe to these emails at any time.

In addition, whenever you visit our Service, we collect information that your browser sends to us that is called Log Data. This Log Data may include information such as your computer’s Internet Protocol (“IP”) address, browser version, pages of our Service that you visit, the time and date of your visit, the time spent on those pages, and other statistics. When you access the Service using a mobile device, we may collect additional device information, such as the type of device you are using, its operating system, and mobile network information.

## [Cookies](#cookies)

Cookies are files with small amount of data that is commonly used an anonymous unique identifier. These are sent to your browser from the website that you visit and are stored on your computer's hard drive.

Our website may use these “cookies” to keep you signed in to our Service. You have the option to either accept or refuse these cookies by changing your browser settings. If you choose to refuse our cookies, you will not stay signed in once you close your browser tab or window.

## [Where we store your data](#data-storage)

VoceSpace transfers, processes and stores data about you on servers operated by our hosting provider located in the United States of America. Your Personal Information may therefore be transferred to, processed and stored in a country different from your country of residence, and be subject to privacy laws that are different from those in your country of residence. Information collected within the European Economic Area (“EEA”) and Switzerland may, for example, be transferred to and processed by third parties referred to below that are located in a country outside of the EEA and Switzerland, where you may have fewer rights in relation to your Personal Information. By using the Service and providing us with your Personal Information, you are consenting to the transfer, processing and storage of your Personal Information in countries outside of your country of residence.

## [Security](#security)

We value your trust in providing us your Personal Information, thus we strive to use all commercially acceptable means of protecting it. However, no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security. We encourage you to use precautions such as two-factor authentication for any account or service that stores sensitive information.

## [Links to Other Sites](#third-party-links)

Our Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by us. Therefore, we strongly advise you to review the Privacy Policy of these websites. We have no control over, and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.

## [How we use your data](#data-usage)

We reserve the right to communicate your Personal Information to third parties to make a legally-compliant request for the disclosure of Personal Information.

In order to carry out certain business functions, such as signing in, authentication, authorization, alert notifications, e-mail delivery, we may hire other companies to perform services on our behalf. We may disclose Personal Information that we collect about you to these companies to enable them to perform these services. However, these companies are obligated not to disclose or use the information for any other purpose.

In addition, it is possible that in the future another company may acquire VoceSpace or its assets or that we may partner with or purchase another company to continue to do business as a combined entity. In the event that any such transaction occurs, it is possible that our customer information, including your Personal Information, may be transferred to the new business entity as one of our assets. In such an event, we will update this policy to reflect any change in ownership or control of your Personal Information.

## [Children's Privacy](#children-privacy)

Our Services do not address anyone under the age of 13. We do not knowingly collect personal identifiable information from children under 13. In the case we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to do necessary actions.

## [Changes to This Privacy Policy](#policy-changes)

We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately, after they are posted on this page.

## CAN SPAM Act

The CAN-SPAM Act is a law that sets the rules for commercial email, establishes requirements for commercial messages, gives recipients the right to have emails stopped from being sent to them, and spells out tough penalties for violations.

We collect your email address in order to send information about our service and respond to inquiries and requests. You can unsubscribe at any time using a link at the bottom of those emails.

## California Privacy Rights

California law gives residents of California the right under certain circumstances to request information from us regarding the manner in which we share certain categories of personal information (as defined by applicable California law) with third parties for their direct marketing purposes.

## [Contact Us](#contact)

If you have any questions about this Policy, please contact us at han@privoce.com.`;

import Markdown from "react-markdown";
import styles from "@/styles/policy.module.scss";
import { useState, useEffect } from "react";

export function PrivacyPolicy() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.policyContainer}>
      {/* 侧边导航 */}
      <aside className={styles.sidebar}>
        <div className={styles.tableOfContents}>
          <h3>In this article</h3>
          <ul>
            <li><a href="#information-collection">Information Collection and Use</a></li>
            <li><a href="#cookies">Cookies</a></li>
            <li><a href="#data-storage">Where we store your data</a></li>
            <li><a href="#security">Security</a></li>
            <li><a href="#third-party-links">Links to Other Sites</a></li>
            <li><a href="#data-usage">How we use your data</a></li>
            <li><a href="#children-privacy">Children's Privacy</a></li>
            <li><a href="#policy-changes">Changes to This Privacy Policy</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>
      </aside>

      {/* 主要内容 */}
      <main className={styles.content}>
        <div className={styles.effectiveDate}>
          Last updated: November 4, 2025
        </div>

        <Markdown>{md}</Markdown>
        
        <div className={styles.contactSection}>
          <h2>Need Help?</h2>
          <p>If you have any questions about this Privacy Policy, please don't hesitate to contact us:</p>
          <p><strong>Email:</strong> <a href="mailto:han@privoce.com">han@privoce.com</a></p>
          <p>We're committed to protecting your privacy and will respond to your inquiries promptly.</p>
        </div>
      </main>

      {showScrollTop && (
        <button 
          className={styles.scrollToTop}
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </div>
  );
}
