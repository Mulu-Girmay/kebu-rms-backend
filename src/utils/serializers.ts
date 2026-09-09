export const serializeUser = (user: any) => {
  const role =
    user.role_id && typeof user.role_id === 'object' && '_id' in user.role_id
      ? {
          id: user.role_id._id,
          name: user.role_id.name,
          description: user.role_id.description,
        }
      : user.role_id
        ? {
            id: user.role_id,
          }
        : null;

  return {
    id: user._id,
    name: user.name || null,
    email: user.email,
    image: user.image ?? user.image ?? null,
    status: user.status,
    role,
    createdAt: user.created_at ?? user.createdAt,
    updatedAt: user.updated_at ?? user.updatedAt ?? user.updateAt ?? null,
  };
};
