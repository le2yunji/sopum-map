"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  CreateCourseRequest,
  UpdateCourseRequest,
} from "@sopum-map/shared";

import {
  createCourse,
  deleteCourse,
  getCourseDetail,
  getMyCourses,
  updateCourse,
} from "./course.api";

export const courseKeys = {
  all: ["courses"] as const,

  details: () => [...courseKeys.all, "detail"] as const,

  detail: (courseId: string) => [...courseKeys.details(), courseId] as const,

  myCourses: () => [...courseKeys.all, "me"] as const,
};

/**
 * 코스 상세 조회
 */
export function useCourseDetail(courseId: string) {
  return useQuery({
    queryKey: courseKeys.detail(courseId),
    queryFn: () => getCourseDetail(courseId),
    enabled: Boolean(courseId),
  });
}

/**
 * 내 코스 목록 조회
 */
export function useMyCourses() {
  return useQuery({
    queryKey: courseKeys.myCourses(),
    queryFn: getMyCourses,
  });
}

/**
 * 코스 생성
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCourseRequest) => createCourse(input),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: courseKeys.myCourses(),
      });
    },
  });
}

/**
 * 코스 수정
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      input,
    }: {
      courseId: string;
      input: UpdateCourseRequest;
    }) => updateCourse(courseId, input),

    onSuccess: async (_, { courseId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: courseKeys.detail(courseId),
        }),

        queryClient.invalidateQueries({
          queryKey: courseKeys.myCourses(),
        }),
      ]);
    },
  });
}

/**
 * 코스 삭제
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourse,

    onSuccess: async (_, courseId) => {
      queryClient.removeQueries({
        queryKey: courseKeys.detail(courseId),
      });

      await queryClient.invalidateQueries({
        queryKey: courseKeys.myCourses(),
      });
    },
  });
}
