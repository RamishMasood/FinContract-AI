
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  } | null;
  error: Error | null;
}

export const authService = {
  async signUp(email: string, password: string, additionalData?: {
    fullName?: string;
    phoneNumber?: string;
    referralEmail?: string;
  }): Promise<AuthResponse> {
    try {
      const redirectUrl = `https://legalinsightai.software/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: additionalData?.fullName,
            phone_number: additionalData?.phoneNumber,
            referral_email: additionalData?.referralEmail,
          }
        }
      });

      if (error) throw error;

      // Check if user needs email confirmation
      if (data.user && !data.session) {
        // User created but needs to confirm email
        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
          },
          error: new Error('Please check your email to confirm your account before logging in'),
        };
      }

      // If user is created and we have additional data, store it
      if (data.user && additionalData) {
        // Handle referral if provided
        if (additionalData.referralEmail) {
          // Find the referrer by email - search using auth users table through a function call
          try {
            // We'll handle referral creation in the database trigger when user_plan is created
            // For now, just store the referral email in user metadata
            console.log('Referral email provided:', additionalData.referralEmail);
          } catch (error) {
            console.error('Error handling referral:', error);
          }
        }
      }

      return {
        user: data.user ? {
          id: data.user.id,
          email: data.user.email!,
        } : null,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: error as Error,
      };
    }
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return {
        user: data.user ? {
          id: data.user.id,
          email: data.user.email!,
        } : null,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: error as Error,
      };
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return {
      user: user ? {
        id: user.id,
        email: user.email!,
      } : null,
      error,
    };
  },

  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const redirectUrl = `https://legalinsightai.software/auth?mode=reset`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      return {
        user: null,
        error: new Error('Password reset email sent. Please check your inbox.'),
      };
    } catch (error) {
      return {
        user: null,
        error: error as Error,
      };
    }
  },

  async updatePassword(newPassword: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return {
        user: data.user ? {
          id: data.user.id,
          email: data.user.email!,
        } : null,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: error as Error,
      };
    }
  }
};

export default authService;
