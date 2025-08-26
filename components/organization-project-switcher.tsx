"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Plus, Settings, Building2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useOrganization } from "@/context/organization-context";

export function OrganizationProjectSwitcher() {
  const { isMobile, open } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const {
    currentOrganization,
    currentProject,
    setCurrentOrganization,
    setCurrentProject,
    organizations,
    projects,
    loading,
    refreshData,
  } = useOrganization();

  // Dialog states
  const [createOrgDialogOpen, setCreateOrgDialogOpen] = useState(false);
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Form data
  const [orgFormData, setOrgFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [projectFormData, setProjectFormData] = useState({
    name: "",
    description: "",
  });

  const generateSlugFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleOrganizationChange = useCallback(
    (organization: any) => {
      setCurrentOrganization(organization);
      setCurrentProject(null); // Reset project when changing org
      
      // Navigate to the organization's projects page
      router.push(`/organizations/${organization.id}`);
    },
    [router, setCurrentOrganization, setCurrentProject]
  );

  const handleProjectChange = useCallback(
    (project: any) => {
      setCurrentProject(project);
      
      // Navigate to project dashboard when switching projects
      router.push(`/projects/${project.id}`);
    },
    [router, setCurrentProject]
  );

  const handleCreateOrganization = async () => {
    try {
      setIsCreatingOrg(true);
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orgFormData,
          aiProcessingEnabled: true,
          autoApprovalThreshold: 0.95,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Show success message with auto-connection status
        if (data.llamaCloudAutoConnected) {
          toast({
            title: "Success",
            description: "Organization created successfully and automatically connected to LlamaCloud",
          });
        } else {
          toast({
            title: "Success",
            description: "Organization created successfully",
          });
        }
        setCreateOrgDialogOpen(false);
        setOrgFormData({ name: "", slug: "", description: "" });
        await refreshData();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create organization",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create organization",
        variant: "destructive",
      });
    } finally {
      setIsCreatingOrg(false);
    }
  };

  const handleCreateProject = async () => {
    if (!currentOrganization) return;

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...projectFormData,
          organizationId: currentOrganization.id,
        }),
      });

      const data = await response.json();
      console.log("OrganizationProjectSwitcher: API response:", data);
      if (data.success) {
        const project = data.data; // Extract project from data property
        console.log("OrganizationProjectSwitcher: Created project:", project);
        
        toast({
          title: "Success", 
          description: "Project created successfully",
        });
        setCreateProjectDialogOpen(false);
        setProjectFormData({ name: "", description: "" });
        
        // Redirect to the new project page
        console.log("OrganizationProjectSwitcher: Redirecting to project:", project.id);
        router.push(`/projects/${project.id}`);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create project",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size={open ? "lg" : "sm"} className="h-14 animate-pulse">
            <div className="flex size-8 items-center justify-center rounded-md bg-gray-200" />
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-3 bg-gray-200 rounded w-16" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Show "Select Organization" state when no organization is selected
  if (!currentOrganization) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size={open ? "lg" : "sm"}
                className="group-data-[collapsible=icon]:p-0! flex h-14 w-full items-center justify-between rounded-md border bg-white py-4 shadow-none hover:bg-gray-50 focus:outline-none group-data-[collapsible=icon]:mt-4 group-data-[collapsible=icon]:h-auto"
                tooltip="Select Organization"
              >
                <div className="flex size-8 items-center justify-center rounded-md bg-gray-400 text-white text-sm font-medium">
                  ?
                </div>
                <div className="flex flex-col items-start overflow-hidden text-ellipsis whitespace-nowrap group-data-[collapsible=icon]:hidden">
                  <span className="font-medium text-sm text-muted-foreground">
                    Select Organization
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Choose to get started
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="flex w-auto flex-col divide-x divide-gray-200 rounded-md border border-gray-200 p-0 shadow-md lg:w-[512px] lg:flex-row"
              side={isMobile ? "bottom" : "right"}
              sideOffset={10}
            >
              {/* Organizations Column */}
              <div className="flex w-full flex-col p-2 lg:w-2/5">
                <DropdownMenuLabel>Organization</DropdownMenuLabel>
                <div className="max-h-[300px] flex-1 overflow-y-auto">
                  {organizations.map((organization) => (
                    <DropdownMenuCheckboxItem
                      key={organization.id}
                      checked={false}
                      onCheckedChange={() => handleOrganizationChange(organization)}
                      className="overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
                    >
                      {organization.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setCreateOrgDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <Plus className="size-4" />
                  <span>Add Organization</span>
                </DropdownMenuItem>
              </div>

              {/* Projects Column */}
              <div className="flex w-full flex-col p-2 lg:w-3/5">
                <DropdownMenuLabel>Project</DropdownMenuLabel>
                <div className="max-h-[300px] flex-1 overflow-y-auto">
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    Select an organization first
                  </div>
                </div>
                <DropdownMenuSeparator />
                <div className="flex flex-row items-center lg:justify-between opacity-50">
                  <DropdownMenuItem className="cursor-not-allowed">
                    <Plus className="size-4" />
                    <span>Add Project</span>
                  </DropdownMenuItem>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size={open ? "lg" : "sm"}
                className="group-data-[collapsible=icon]:p-0! flex h-14 w-full items-center justify-between rounded-md border bg-white py-4 shadow-none hover:bg-gray-50 focus:outline-none group-data-[collapsible=icon]:mt-4 group-data-[collapsible=icon]:h-auto"
                tooltip="Switch Organization/Project"
              >
                <div className="flex size-8 items-center justify-center rounded-md bg-purple-600 text-white text-sm font-medium">
                  {currentOrganization.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex flex-col items-start overflow-hidden text-ellipsis whitespace-nowrap group-data-[collapsible=icon]:hidden">
                  <span className="font-medium text-sm">
                    {currentProject?.name || "No Project"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {currentOrganization.name}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="flex w-auto flex-col divide-x divide-gray-200 rounded-md border border-gray-200 p-0 shadow-md lg:w-[512px] lg:flex-row"
              side={isMobile ? "bottom" : "right"}
              sideOffset={10}
            >
              {/* Organizations Column */}
              <div className="flex w-full flex-col p-2 lg:w-2/5">
                <DropdownMenuLabel>Organization</DropdownMenuLabel>
                <div className="max-h-[300px] flex-1 overflow-y-auto">
                  {organizations.map((organization) => (
                    <DropdownMenuCheckboxItem
                      key={organization.id}
                      checked={organization.id === currentOrganization.id}
                      onCheckedChange={() => handleOrganizationChange(organization)}
                      className="overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
                    >
                      {organization.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setCreateOrgDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <Plus className="size-4" />
                  <span>Add Organization</span>
                </DropdownMenuItem>
              </div>

              {/* Projects Column */}
              <div className="flex w-full flex-col p-2 lg:w-3/5">
                <DropdownMenuLabel>Project</DropdownMenuLabel>
                <div className="max-h-[300px] flex-1 overflow-y-auto">
                  {projects.map((project) => (
                    <DropdownMenuCheckboxItem
                      key={project.id}
                      checked={project.id === currentProject?.id}
                      onCheckedChange={() => handleProjectChange(project)}
                      className="overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
                    >
                      {project.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {projects.length === 0 && (
                    <div className="px-2 py-1 text-sm text-muted-foreground">
                      No projects yet
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <div className="flex flex-row items-center lg:justify-between">
                  <DropdownMenuItem
                    onClick={() => setCreateProjectDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    <Plus className="size-4" />
                    <span>Add Project</span>
                  </DropdownMenuItem>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Create Organization Dialog */}
      <Dialog open={createOrgDialogOpen} onOpenChange={setCreateOrgDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={orgFormData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setOrgFormData(prev => ({
                    ...prev,
                    name,
                    slug: generateSlugFromName(name)
                  }));
                }}
                placeholder="My Organization"
                disabled={isCreatingOrg}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug">Slug</Label>
              <Input
                id="org-slug"
                value={orgFormData.slug}
                onChange={(e) => setOrgFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="my-organization"
                disabled={isCreatingOrg}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-description">Description</Label>
              <Textarea
                id="org-description"
                value={orgFormData.description}
                onChange={(e) => setOrgFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Organization description..."
                disabled={isCreatingOrg}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setCreateOrgDialogOpen(false)} disabled={isCreatingOrg}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrganization} disabled={isCreatingOrg}>
                {isCreatingOrg && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isCreatingOrg ? "Creating Organization..." : "Create Organization"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Project Dialog */}
      <Dialog open={createProjectDialogOpen} onOpenChange={setCreateProjectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectFormData.name}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Project"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={projectFormData.description}
                onChange={(e) => setProjectFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Project description..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setCreateProjectDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject}>
                Create Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 