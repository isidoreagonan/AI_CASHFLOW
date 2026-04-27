import { useState } from "react";
import { useListFiles, useCreateFile, useDeleteFile, getListFilesQueryKey } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, FileText, Download } from "lucide-react";
import { format } from "date-fns";

interface ModuleItem {
  id: number;
  courseId: number;
  courseTitle: string;
  title: string;
  order: number;
}

export default function AdminFiles() {
  const { data: files, isLoading: isFilesLoading } = useListFiles();
  const queryClient = useQueryClient();

  // Fetch all modules across all courses via the dedicated endpoint
  const API_BASE = (import.meta.env.BASE_URL as string).replace(/\/$/, "");
  const { data: allModules = [], isLoading: isModulesLoading } = useQuery<ModuleItem[]>({
    queryKey: ["/api/modules"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/modules`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load modules");
      return res.json();
    },
  });

  const createFile = useCreateFile();
  const deleteFile = useDeleteFile();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileForm, setFileForm] = useState({
    moduleId: 0,
    name: "",
    description: "",
    fileUrl: "",
    fileType: "pdf" as any,
    fileSize: ""
  });

  const handleOpenModal = () => {
    setFileForm({ moduleId: 0, name: "", description: "", fileUrl: "", fileType: "pdf", fileSize: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileForm.moduleId) {
      toast({ title: "Veuillez sélectionner un module", variant: "destructive" });
      return;
    }
    try {
      await createFile.mutateAsync({ data: fileForm });
      queryClient.invalidateQueries({ queryKey: getListFilesQueryKey() });
      setIsModalOpen(false);
      toast({ title: "Ressource ajoutée avec succès" });
    } catch (error) {
      toast({ title: "Échec de l'ajout", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette ressource ?")) return;
    try {
      await deleteFile.mutateAsync({ fileId: id });
      queryClient.invalidateQueries({ queryKey: getListFilesQueryKey() });
      toast({ title: "Ressource supprimée" });
    } catch {
      toast({ title: "Échec de la suppression", variant: "destructive" });
    }
  };

  if (isFilesLoading || isModulesLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gérer les ressources</h1>
        <Button onClick={handleOpenModal} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Ajouter une ressource
        </Button>
      </div>

      <div className="border rounded-md bg-card/50 backdrop-blur overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fichier</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Taille</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files?.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div>{file.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{file.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="uppercase text-xs font-semibold">{file.fileType}</TableCell>
                <TableCell>{file.fileSize}</TableCell>
                <TableCell>{format(new Date(file.createdAt), "d MMM yyyy")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(file.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!files?.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Aucune ressource. Ajoutez-en une !
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une ressource</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Module</Label>
              <Select
                value={fileForm.moduleId ? fileForm.moduleId.toString() : ""}
                onValueChange={val => setFileForm({ ...fileForm, moduleId: parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un module…" />
                </SelectTrigger>
                <SelectContent>
                  {allModules.length === 0 && (
                    <SelectItem value="__none__" disabled>Aucun module trouvé</SelectItem>
                  )}
                  {allModules.map(m => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.courseTitle} — {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={fileForm.name} onChange={e => setFileForm({ ...fileForm, name: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={fileForm.description} onChange={e => setFileForm({ ...fileForm, description: e.target.value })} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type de fichier</Label>
                <Select value={fileForm.fileType} onValueChange={val => setFileForm({ ...fileForm, fileType: val as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">📄 PDF</SelectItem>
                    <SelectItem value="guide">📘 Guide</SelectItem>
                    <SelectItem value="resource">📁 Ressource</SelectItem>
                    <SelectItem value="video">🎬 Vidéo</SelectItem>
                    <SelectItem value="link">🔗 Lien cliquable</SelectItem>
                    <SelectItem value="other">📎 Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Taille</Label>
                <Input value={fileForm.fileSize} onChange={e => setFileForm({ ...fileForm, fileSize: e.target.value })} placeholder="ex. 2.4 MB" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL du fichier</Label>
              <Input value={fileForm.fileUrl} onChange={e => setFileForm({ ...fileForm, fileUrl: e.target.value })} required placeholder="https://..." />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={createFile.isPending}>
                {createFile.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
