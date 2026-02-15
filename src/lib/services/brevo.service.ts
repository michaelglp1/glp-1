import { z } from "zod";

// Brevo API types
interface BrevoContact {
  email: string;
  attributes?: Record<string, any>;
  listIds?: number[];
  updateEnabled?: boolean;
}

interface BrevoResponse {
  id?: number;
  message?: string;
}

interface BrevoEmailRequest {
  templateId: number;
  to: Array<{
    email: string;
    name?: string;
  }>;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

interface BrevoEmailResponse {
  messageId: string;
}

// Validation schema for Brevo contact
const brevoContactSchema = z.object({
  email: z.string().email(),
  attributes: z.record(z.string(), z.any()).optional(),
  listIds: z.array(z.number()).optional(),
});

// Validation schema for email sending
const brevoEmailSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  params: z.record(z.string(), z.any()).optional(),
});

export class BrevoService {
  private static apiKey = process.env.BREVO_API_KEY;
  private static waitlistId = process.env.BREVO_WAITLIST_ID;
  private static joinListId = process.env.BREVO_JOIN_LIST_ID; // List for users who just signed up
  private static registerListId = process.env.BREVO_REGISTER_LIST_ID; // List for users who completed registration
  private static subscribeListId = process.env.BREVO_SUBSCRIBE_LIST_ID; // List for users who subscribed (paid)
  private static signupTemplateId = process.env.BREVO_SIGNUP_TEMPLATE_ID || "3"; // Template for signup welcome email
  private static baseUrl = "https://api.brevo.com/v3";

  private static getHeaders() {
    if (!this.apiKey) {
      throw new Error("BREVO_API_KEY environment variable is not set");
    }

    return {
      "Content-Type": "application/json",
      "api-key": this.apiKey,
    };
  }

  /**
   * Add a contact to Brevo waitlist
   * This method is designed to be non-blocking - it won't throw errors that would break the main flow
   */
  static async addContactToWaitlist(
    email: string,
    attributes: Record<string, any> = {},
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate input
      const validatedData = brevoContactSchema.parse({
        email,
        attributes,
        listIds: this.waitlistId ? [parseInt(this.waitlistId)] : undefined,
      });

      // Skip if API key or waitlist ID not configured
      if (!this.apiKey || !this.waitlistId) {
        console.warn(
          "Brevo API key or waitlist ID not configured. Skipping email list addition.",
        );
        return { success: false, error: "Brevo not configured" };
      }

      const contact: BrevoContact = {
        email: validatedData.email.toLowerCase().trim(),
        attributes: {
          SIGNUP_DATE: new Date().toISOString(),
          SOURCE: "waitlist",
          ...validatedData.attributes,
        },
        listIds: validatedData.listIds,
        updateEnabled: true, // Update contact if already exists
      };

      const response = await fetch(`${this.baseUrl}/contacts`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(contact),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific Brevo errors gracefully
        if (
          response.status === 400 &&
          errorData.code === "duplicate_parameter"
        ) {
          // Contact already exists - this is okay
          console.log(`Contact ${email} already exists in Brevo list`);
          return { success: true };
        }

        throw new Error(
          `Brevo API error: ${response.status} - ${
            errorData.message || "Unknown error"
          }`,
        );
      }

      const result: BrevoResponse = await response.json();
      console.log(
        `Successfully added ${email} to Brevo waitlist (ID: ${result.id})`,
      );

      return { success: true };
    } catch (error: any) {
      // Log error but don't throw - we want waitlist signup to succeed even if Brevo fails
      console.error("Failed to add contact to Brevo waitlist:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add a user who just joined (incomplete profile) to Brevo join list
   * This method is designed to be non-blocking - it won't throw errors that would break the main flow
   */
  static async addJoinedUser(
    email: string,
    firstName: string,
    lastName: string,
    plan: string = "free",
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate input
      const validatedData = brevoContactSchema.parse({
        email,
        attributes: {
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          PLAN: plan,
          SOURCE: "app_signup",
          CREATED_AT: new Date().toISOString(),
        },
        listIds: this.joinListId ? [parseInt(this.joinListId)] : undefined,
      });

      // Skip if API key or join list ID not configured
      if (!this.apiKey || !this.joinListId) {
        console.warn(
          "Brevo API key or join list ID not configured. Skipping email list addition.",
        );
        return { success: false, error: "Brevo not configured" };
      }

      const contact: BrevoContact = {
        email: validatedData.email.toLowerCase().trim(),
        attributes: validatedData.attributes,
        listIds: validatedData.listIds,
        updateEnabled: true, // Update contact if already exists
      };

      const response = await fetch(`${this.baseUrl}/contacts`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(contact),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific Brevo errors gracefully
        if (
          response.status === 400 &&
          errorData.code === "duplicate_parameter"
        ) {
          // Contact already exists - this is okay
          console.log(`Contact ${email} already exists in Brevo join list`);
          return { success: true };
        }

        throw new Error(
          `Brevo API error: ${response.status} - ${
            errorData.message || "Unknown error"
          }`,
        );
      }

      const result: BrevoResponse = await response.json();
      console.log(
        `Successfully added ${email} to Brevo join list (ID: ${result.id})`,
      );

      return { success: true };
    } catch (error: any) {
      // Log error but don't throw - we want signup to succeed even if Brevo fails
      console.error("Failed to add joined user to Brevo:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add a user who completed registration to Brevo registered list
   * This method is designed to be non-blocking - it won't throw errors that would break the main flow
   */
  static async addRegisteredUser(
    email: string,
    firstName: string,
    lastName: string,
    plan: string = "free",
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate input
      const validatedData = brevoContactSchema.parse({
        email,
        attributes: {
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          PLAN: plan,
          SOURCE: "app_signup",
          CREATED_AT: new Date().toISOString(),
          REGISTERED_AT: new Date().toISOString(),
        },
        listIds: this.registerListId
          ? [parseInt(this.registerListId)]
          : undefined,
      });

      // Skip if API key or list ID not configured
      if (!this.apiKey || !this.registerListId) {
        console.warn(
          "Brevo API key or registered list ID not configured. Skipping email list addition.",
        );
        return { success: false, error: "Brevo not configured" };
      }

      const contact: BrevoContact = {
        email: validatedData.email.toLowerCase().trim(),
        attributes: validatedData.attributes,
        listIds: validatedData.listIds,
        updateEnabled: true, // Update contact if already exists
      };

      const response = await fetch(`${this.baseUrl}/contacts`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(contact),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific Brevo errors gracefully
        if (
          response.status === 400 &&
          errorData.code === "duplicate_parameter"
        ) {
          // Contact already exists - update them instead
          console.log(
            `Contact ${email} already exists, updating to registered list`,
          );
          return { success: true };
        }

        throw new Error(
          `Brevo API error: ${response.status} - ${
            errorData.message || "Unknown error"
          }`,
        );
      }

      const result: BrevoResponse = await response.json();
      console.log(
        `Successfully added ${email} to Brevo registered list (ID: ${result.id})`,
      );

      return { success: true };
    } catch (error: any) {
      // Log error but don't throw - we want registration to succeed even if Brevo fails
      console.error("Failed to add registered user to Brevo:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove a contact from Brevo email list
   */
  static async removeContactFromList(
    email: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: "Brevo not configured" };
      }

      const response = await fetch(
        `${this.baseUrl}/contacts/${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        },
      );

      if (!response.ok && response.status !== 404) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Brevo API error: ${response.status} - ${
            errorData.message || "Unknown error"
          }`,
        );
      }

      console.log(`Successfully removed ${email} from Brevo`);
      return { success: true };
    } catch (error: any) {
      console.error("Failed to remove contact from Brevo:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get contact information from Brevo
   */
  static async getContact(
    email: string,
  ): Promise<{ success: boolean; contact?: any; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: "Brevo not configured" };
      }

      const response = await fetch(
        `${this.baseUrl}/contacts/${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        },
      );

      if (response.status === 404) {
        return { success: true, contact: null };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Brevo API error: ${response.status} - ${
            errorData.message || "Unknown error"
          }`,
        );
      }

      const contact = await response.json();
      return { success: true, contact };
    } catch (error: any) {
      console.error("Failed to get contact from Brevo:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send transactional email using Brevo template
   * This method sends welcome email when user joins waitlist
   */
  static async sendWaitlistWelcomeEmail(
    email: string,
    name?: string,
    params: Record<string, any> = {},
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Validate input
      const validatedData = brevoEmailSchema.parse({
        email,
        name,
        params,
      });

      // Skip if API key not configured
      if (!this.apiKey) {
        console.warn("Brevo API key not configured. Skipping welcome email.");
        return { success: false, error: "Brevo not configured" };
      }

      const emailRequest: BrevoEmailRequest = {
        templateId: 1, // Template ID yang sudah dibuat di Brevo
        to: [
          {
            email: validatedData.email.toLowerCase().trim(),
            name: validatedData.name || validatedData.email.split("@")[0],
          },
        ],
        params: {
          // Default parameters yang bisa digunakan di template
          EMAIL: validatedData.email,
          NAME: validatedData.name || validatedData.email.split("@")[0],
          SIGNUP_DATE: new Date().toLocaleDateString("id-ID"),
          ...validatedData.params,
        },
        headers: {
          "X-Mailin-custom": "waitlist_welcome|" + new Date().toISOString(),
        },
      };

      const response = await fetch(`${this.baseUrl}/smtp/email`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(emailRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Brevo email API error: ${response.status} - ${
            errorData.message || "Unknown error"
          }`,
        );
      }

      const result: BrevoEmailResponse = await response.json();
      console.log(
        `Successfully sent welcome email to ${email} (Message ID: ${result.messageId})`,
      );

      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      // Log error but don't throw - we want waitlist signup to succeed even if email fails
      console.error("Failed to send welcome email via Brevo:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email to new user after signup (v1 - no template)
   * Sends transactional email with HTML content directly
   */
  static async sendSignupWelcomeEmail(
    email: string,
    firstName: string,
    lastName: string,
    params: Record<string, any> = {},
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Validate input
      const validatedData = brevoEmailSchema.parse({
        email,
        name: `${firstName} ${lastName}`,
        params,
      });

      // Skip if API key not configured
      if (!this.apiKey) {
        console.warn(
          "Brevo API key not configured. Skipping signup welcome email.",
        );
        return { success: false, error: "Brevo not configured" };
      }

      const dashboardUrl = "https://mydailyhealthjournal.com/home";

      // HTML email content based on Michael's copy
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to My Daily Health Journal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header with Brand Name -->
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <p style="margin: 0 0 30px 0; font-size: 20px; font-weight: 700; color: #1f2937; text-align: center;">
                My Daily Health Journal
              </p>
            </td>
          </tr>
          
          <!-- Email Content -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                Hi ${firstName} — welcome to My Daily Health Journal.
              </p>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                Start with one quick entry (weight, blood pressure, or blood sugar). Your graphs update instantly so you can spot trends and pull them up anytime, including at appointments.
              </p>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 40px 30px 40px;">
              <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                Open Free Dashboard
              </a>
            </td>
          </tr>
          
          <!-- Footer Text -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                If you have questions, reply to this email.
              </p>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333333;">
                — Michael
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const emailRequest: any = {
        sender: {
          name: "My Daily Health Journal",
          email:
            process.env.BREVO_SENDER_EMAIL ||
            "noreply@mydailyhealthjournal.com",
        },
        to: [
          {
            email: validatedData.email.toLowerCase().trim(),
            name: validatedData.name,
          },
        ],
        subject: "Welcome to My Daily Health Journal",
        htmlContent: htmlContent,
        headers: {
          "X-Mailin-custom": "signup_welcome|" + new Date().toISOString(),
        },
        tags: ["signup", "welcome"],
      };

      const response = await fetch(`${this.baseUrl}/smtp/email`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(emailRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Brevo email API error: ${response.status} - ${
            errorData.message || "Unknown error"
          }`,
        );
      }

      const result: BrevoEmailResponse = await response.json();
      console.log(
        `Successfully sent signup welcome email to ${email} (Message ID: ${result.messageId})`,
      );

      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      // Log error but don't throw - we want signup to succeed even if email fails
      console.error(
        "Failed to send signup welcome email via Brevo:",
        error.message,
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Test Brevo API connection
   */
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: "BREVO_API_KEY not configured" };
      }

      const response = await fetch(`${this.baseUrl}/account`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Brevo API error: ${response.status} - ${
            errorData.message || "Unknown error"
          }`,
        );
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Add a user who subscribed (paid) to Brevo subscribe list
   * This method is designed to be non-blocking - it won't throw errors that would break the main flow
   */
  static async addSubscribedUser(
    email: string,
    firstName: string,
    lastName: string,
    plan: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate input
      const validatedData = brevoContactSchema.parse({
        email,
        attributes: {
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          PLAN: plan,
          SOURCE: "app_signup",
          CREATED_AT: new Date().toISOString(),
          SUBSCRIBED_AT: new Date().toISOString(),
        },
        listIds: this.subscribeListId
          ? [parseInt(this.subscribeListId)]
          : undefined,
      });

      // Skip if API key or list ID not configured
      if (!this.apiKey || !this.subscribeListId) {
        console.warn(
          "Brevo API key or subscribe list ID not configured. Skipping email list addition.",
        );
        return { success: false, error: "Brevo not configured" };
      }

      const contact: BrevoContact = {
        email: validatedData.email.toLowerCase().trim(),
        attributes: validatedData.attributes,
        listIds: validatedData.listIds,
        updateEnabled: true, // Update contact if already exists
      };

      const response = await fetch(`${this.baseUrl}/contacts`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(contact),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific Brevo errors gracefully
        if (
          response.status === 400 &&
          errorData.code === "duplicate_parameter"
        ) {
          // Contact already exists - update them instead
          console.log(
            `Contact ${email} already exists, updating to subscribe list`,
          );
          return { success: true };
        }

        throw new Error(
          `Brevo API error: ${response.status} - ${
            errorData.message || "Unknown error"
          }`,
        );
      }

      const result: BrevoResponse = await response.json();
      console.log(
        `Successfully added ${email} to Brevo subscribe list (ID: ${result.id})`,
      );

      return { success: true };
    } catch (error: any) {
      // Log error but don't throw - we want subscription to succeed even if Brevo fails
      console.error("Failed to add subscribed user to Brevo:", error.message);
      return { success: false, error: error.message };
    }
  }
}
