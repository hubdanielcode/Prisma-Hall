"use client";

import { getReviewEditDeadline, isReviewEditOpen } from "@/shared/utils/functions/reviewEditPolicy";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { useEffect, useState } from "react";
import type { ReviewWithDetails } from "@/features/events/reviews/types/reviews";

interface ProfileReviewActionsProps {
  review: ReviewWithDetails;
  onEdit: () => void;
  onDelete: () => void;
}

const ProfileReviewsActions = ({ review, onEdit, onDelete }: ProfileReviewActionsProps) => {
  /* - Estado do prazo de edição - */

  const [canEdit, setCanEdit] = useState<boolean>(() => isReviewEditOpen(review.createdAt));

  /* - Funções - */

  // 1. Esconde o botão de editar no instante em que o prazo acaba, sem precisar recarregar a página

  useEffect(() => {
    const remainingTime = getReviewEditDeadline(review.createdAt).getTime() - Date.now();

    if (remainingTime <= 0) {
      return;
    }

    const timeout = setTimeout(() => setCanEdit(false), remainingTime);

    return () => clearTimeout(timeout);
  }, [review.createdAt]);

  return (
    <div className="flex flex-col w-full items-start justify-center gap-2 pt-4">
      {/* - Editar avaliação (só dentro do prazo) - */}

      {canEdit && (
        <button
          className="flex items-center gap-3 text-sm text-white/60 uppercase pt-3 cursor-pointer group/link"
          type="button"
          onClick={onEdit}
        >
          <MdOutlineEdit className="group-hover/link:text-[#B8860B]" />

          <span className="group-hover/link:text-transparent group-hover/link:bg-clip-text group-hover/link:bg-linear-to-br group-hover/link:from-yellow-500 group-hover/link:via-[#B8860B] group-hover/link:to-yellow-700 group-hover/link:underline">
            Editar Avaliação
          </span>
        </button>
      )}

      {/* - Excluir avaliação - */}

      <button
        className="flex items-center gap-3 text-sm text-white/60 uppercase pt-3 cursor-pointer group/link"
        type="button"
        onClick={onDelete}
      >
        <MdDeleteOutline className="group-hover/link:text-[#B8860B]" />

        <span className="group-hover/link:text-transparent group-hover/link:bg-clip-text group-hover/link:bg-linear-to-br group-hover/link:from-yellow-500 group-hover/link:via-[#B8860B] group-hover/link:to-yellow-700 group-hover/link:underline">
          Excluir Avaliação
        </span>
      </button>
    </div>
  );
};

export { ProfileReviewsActions };
