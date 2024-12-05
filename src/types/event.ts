export interface Event {
    id: string;
    title: string;
    date: string;
    location: string;
    description: string;
    createdAt: string;
    createdBy: string;
    attendees: string[]; // IDs de usuarios que confirmaron asistencia
    comments: Comment[];
  }
  
  export interface Comment {
    id: string;
    userId: string;
    text: string;
    rating: number;
    createdAt: string;
  }
  
  export interface UserStats {
    totalEvents: number;
    upcomingEvents: number;
    pastEvents: number;
    averageRating: number;
    totalComments: number;
  }
  
  