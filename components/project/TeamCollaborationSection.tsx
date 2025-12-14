'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Check, X, Crown, Star, Mail } from 'lucide-react';

interface TeamMember {
  id: string;
  userId: string;
  role: 'OWNER' | 'CO_LEAD' | 'MEMBER';
  tasksCompleted: number;
  hoursContributed: number;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
    level: number;
  };
}

interface CollaborationRequest {
  id: string;
  userId: string;
  message?: string;
  skills: string[];
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
  };
}

interface Props {
  projectId: string;
  isOwner: boolean;
  isCoLead: boolean;
  openForCollaboration: boolean;
  currentTeamSize: number;
  maxTeamSize: number;
}

export default function TeamCollaborationSection({
  projectId,
  isOwner,
  isCoLead,
  openForCollaboration,
  currentTeamSize,
  maxTeamSize,
}: Props) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debug logging
  useEffect(() => {
    console.log('[TeamCollaboration] Props:', {
      projectId,
      isOwner,
      isCoLead,
      openForCollaboration,
      currentTeamSize,
      maxTeamSize,
    });
  }, [isOwner, isCoLead]);

  useEffect(() => {
    fetchTeamData();
  }, [projectId, isOwner, isCoLead]);

  const fetchTeamData = async () => {
    setIsLoading(true);
    console.log('[TeamCollaboration] Fetching team data, isOwner:', isOwner, 'isCoLead:', isCoLead);
    try {
      // Fetch members
      const membersRes = await fetch(`/api/projects/${projectId}/members`);
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        console.log('[TeamCollaboration] Members fetched:', membersData.members?.length);
        setMembers(membersData.members || []);
      }

      // Fetch requests only if owner or co-lead
      if (isOwner || isCoLead) {
        console.log('[TeamCollaboration] Fetching collaboration requests...');
        const requestsRes = await fetch(
          `/api/projects/${projectId}/collaboration-requests`
        );
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          console.log('[TeamCollaboration] Requests fetched:', requestsData.requests?.length);
          setRequests(requestsData.requests || []);
        } else {
          console.log('[TeamCollaboration] Requests fetch failed:', requestsRes.status);
        }
      } else {
        console.log('[TeamCollaboration] Skipping requests fetch (not owner/co-lead)');
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAction = async (
    requestId: string,
    action: 'accept' | 'reject'
  ) => {
    try {
      const response = await fetch(`/api/collaboration-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        alert(
          action === 'accept'
            ? 'Request accepted! Member added to team.'
            : 'Request rejected.'
        );
        fetchTeamData(); // Refresh
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to process request');
      }
    } catch (error) {
      console.error('Error processing request:', error);
      alert('Failed to process request');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch(
        `/api/projects/${projectId}/members/${memberId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        alert('Member removed from team');
        fetchTeamData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'CO_LEAD':
        return <Star className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'Owner';
      case 'CO_LEAD':
        return 'Co-Lead';
      case 'MEMBER':
        return 'Member';
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading team...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-600" />
              <CardTitle>Team Members</CardTitle>
              <Badge variant="secondary">
                {currentTeamSize}/{maxTeamSize}
              </Badge>
            </div>
            {openForCollaboration && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <UserPlus className="mr-1 h-3 w-3" />
                Open for Collaboration
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No team members yet
              </p>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{member.user.name}</p>
                        {getRoleIcon(member.role)}
                        <Badge variant="outline" className="text-xs">
                          {getRoleLabel(member.role)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Level {member.user.level} • {member.tasksCompleted}{' '}
                        tasks completed
                      </p>
                    </div>
                  </div>
                  {isOwner && member.role !== 'OWNER' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Requests - Only visible to owner and co-leads */}
      {(isOwner || isCoLead) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary-600" />
              <CardTitle>Collaboration Requests</CardTitle>
              {requests.length > 0 && <Badge>{requests.length}</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <Mail className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-sm font-medium text-gray-900">
                  No collaboration requests yet
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {openForCollaboration
                    ? 'When students request to join, they will appear here'
                    : 'Open your project for collaboration to receive requests'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-lg border border-primary-200 bg-primary-50/30 p-4"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700">
                        {request.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{request.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleRequestAction(request.id, 'reject')
                        }
                        className="gap-1"
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleRequestAction(request.id, 'accept')
                        }
                        className="gap-1"
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </Button>
                    </div>
                  </div>

                  {request.message && (
                    <p className="mb-2 text-sm text-gray-700">
                      "{request.message}"
                    </p>
                  )}

                  {request.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {request.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
