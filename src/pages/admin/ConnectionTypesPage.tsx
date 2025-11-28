/**
 * Connection Types Management Page
 *
 * Admin page for managing connection types used in AI group generation.
 * Supports: view, create, edit, delete, toggle active status.
 */

import { useState, useEffect, useCallback } from "react";
import { Box, Text, Button } from "@mond-design-system/theme";
import { Modal, ModalBody, ModalFooter } from "@mond-design-system/theme/client";
import { useToast } from "../../providers/useToast";
import { ConnectionTypeStore } from "../../services/group-generator";
import type { ConnectionType } from "../../services/group-generator";
import { ConnectionTypeHeader } from "./components/ConnectionTypeHeader";
import { ConnectionTypeCard } from "./components/ConnectionTypeCard";
import { ConnectionTypesFilter } from "./components/ConnectionTypesFilter";
import {
  ConnectionTypeForm,
  ConnectionTypeFormData,
} from "./components/ConnectionTypeForm";

const store = new ConnectionTypeStore();

export function ConnectionTypesPage() {
  const { showSuccess, showError } = useToast();
  const [connectionTypes, setConnectionTypes] = useState<ConnectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreating, setIsCreating] = useState(false);
  const [editingType, setEditingType] = useState<ConnectionType | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadConnectionTypes = useCallback(async () => {
    setLoading(true);
    try {
      const types = await store.getAll();
      setConnectionTypes(types);
    } catch (err) {
      showError(
        "Failed to load",
        err instanceof Error ? err.message : "Failed to load connection types",
      );
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadConnectionTypes();
  }, [loadConnectionTypes]);

  const closeForm = () => {
    setIsCreating(false);
    setEditingType(null);
  };

  const handleCreate = async (data: ConnectionTypeFormData) => {
    try {
      await store.create(data);
      showSuccess("Connection type created");
      closeForm();
      loadConnectionTypes();
    } catch (err) {
      showError(
        "Failed to create",
        err instanceof Error ? err.message : "Failed to create connection type",
      );
    }
  };

  const handleUpdate = async (data: ConnectionTypeFormData) => {
    if (!editingType) return;
    try {
      await store.update(editingType.id, data);
      showSuccess("Connection type updated");
      closeForm();
      loadConnectionTypes();
    } catch (err) {
      showError(
        "Failed to update",
        err instanceof Error ? err.message : "Failed to update connection type",
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await store.delete(id);
      showSuccess("Connection type deleted");
      setDeleteConfirmId(null);
      loadConnectionTypes();
    } catch (err) {
      showError(
        "Failed to delete",
        err instanceof Error ? err.message : "Failed to delete connection type",
      );
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await store.toggleActive(id);
      showSuccess("Status toggled");
      loadConnectionTypes();
    } catch (err) {
      showError(
        "Failed to toggle",
        err instanceof Error ? err.message : "Failed to toggle status",
      );
    }
  };

  if (loading) {
    return (
      <Box padding="4">
        <Text>Loading connection types...</Text>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap="xs" padding="4">
      <ConnectionTypeHeader onAddNew={() => setIsCreating(true)} />

      {/* Create/Edit Form */}
      {(isCreating || editingType) && (
        <ConnectionTypeForm
          isEditing={!!editingType}
          initialValues={
            editingType
              ? {
                  name: editingType.name,
                  category: editingType.category,
                  description: editingType.description,
                  examples: editingType.examples,
                  active: editingType.active,
                }
              : undefined
          }
          onSubmit={editingType ? handleUpdate : handleCreate}
          onCancel={closeForm}
        />
      )}

      <ConnectionTypesFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        filteredCount={
          selectedCategory === "all"
            ? connectionTypes.length
            : connectionTypes.filter((t) => t.category === selectedCategory)
                .length
        }
        totalCount={connectionTypes.length}
      />

      {/* Connection Types List */}
      <Box display="flex" flexDirection="column" gap="xs">
        {(selectedCategory === "all"
          ? connectionTypes
          : connectionTypes.filter((t) => t.category === selectedCategory)
        ).map((type) => (
          <ConnectionTypeCard
            key={type.id}
            connectionType={type}
            onToggleActive={handleToggleActive}
            onEdit={setEditingType}
            onDelete={setDeleteConfirmId}
          />
        ))}
      </Box>

      {connectionTypes.length === 0 && (
        <Box padding="4">
          <Text color="muted">
            No connection types found. Create one to get started!
          </Text>
        </Box>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Connection Type"
        size="sm"
      >
        <ModalBody>
          <Text size="md">
            Are you sure you want to delete this connection type? This action
            cannot be undone.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Box display="flex" gap="sm" justifyContent="flex-end">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Delete
            </Button>
          </Box>
        </ModalFooter>
      </Modal>
    </Box>
  );
}
