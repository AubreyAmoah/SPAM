import prisma from "../../config/prisma/prismaClient.js";

export async function create(data) {
  try {
    // Check if the user already exists using `findUnique`
    const userExists = await prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
      },
    });

    if (userExists) {
      return "User already exists";
    }

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
      },
    });

    if (!newUser) return "User creation failed.";

    return "User created successfully";
  } catch (error) {
    // Log or handle the error appropriately
    console.error(error);
    return `Error: ${error.message}`;
  }
}

export async function validateUserSignIn(data) {
  try {
    // Check if the user already exists using `findUnique`
    const userExists = await prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.username }],
      },
    });

    return userExists
  } catch (error) {
    // Log or handle the error appropriately
    console.error(error);
    return `Error: ${error.message}`;
  }
}

export async function createRefreshToken(email, refreshToken) {
  try {
    await prisma.refreshToken.create({
      data: {
        email,
        refreshToken,
      },
    });

    return 'Refresh token created'
  } catch (error) {
    console.error(error);
    return `Error: ${error.message}`;
  }
}

export async function compareRefreshToken(token) {
  try {
    const refresh = await prisma.refreshToken.findMany({
      where:{
        refreshToken: token
      }
    })

    return refresh
  } catch (error) {
    console.error(error);
    return `Error: ${error.message}`;
  }
}
export async function deleteRefreshToken(token) {
  try {
    await prisma.refreshToken.delete({
      where: {
        refreshToken: token,
      },
    });

    return 'Refresh token deleted'
  } catch (error) {
    console.error(error);
    return `Error: ${error.message}`;
  }
}
