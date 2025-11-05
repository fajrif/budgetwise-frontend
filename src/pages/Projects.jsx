import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI, budgetItemsAPI, transactionsAPI } from '../api/endpoints';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, Search } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const queryClient = useQueryClient();

  const { data: projectsData = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsAPI.getAll();
      return response.data;
    },
  });

  const { data: budgetItemsData = [] } = useQuery({
    queryKey: ['budgetItems'],
    queryFn: async () => {
      const response = await budgetItemsAPI.getAll();
      return response.data;
    },
  });

  const { data: transactionsData = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await transactionsAPI.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => projectsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setShowForm(false);
      setEditingProject(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => projectsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setShowForm(false);
      setEditingProject(null);
    },
  });

  const handleSubmit = (data) => {
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredProjects = projectsData.filter(
    (project) =>
      project.judul_pekerjaan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.no_sp2k?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Proyek</h1>
            <p className="text-slate-500 mt-1">Kelola semua data proyek dan kontrak</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Proyek
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Cari proyek..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {showForm && (
          <ProjectForm
            project={editingProject}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingProject(null);
            }}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div>Loading...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              Belum ada proyek
            </div>
          ) : (
            filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                budgetItems={budgetItemsData}
                transactions={transactionsData}
                onEdit={(p) => {
                  setEditingProject(p);
                  setShowForm(true);
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
