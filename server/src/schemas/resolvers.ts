import User from '../models/User.js';
import { signToken, AuthenticationError } from '../services/auth.js';

interface User {
    _id: string;
    username: string;
    email: string;
    bookCount: number;
    savedBooks: Book[];
}

interface Book {
    bookId: string;
    authors: string[];
    description: string;
    title: string;
    image: string;
    link: string;
}

interface Context {// Define the context interface
    user: User;
}

interface AddUserArgs {

    username: string;
    email: string;
    password: string;

}

interface UserArgs {
    email: string;
    password: string;
}

interface SaveBookArgs {
    input: {
        authors: string[];
        description: string;
        title: string;
        bookId: string;
        image: string;
        link?: string;
    }
}

export const resolvers = {
    Query: {
    
        me: async (_parent: any, _args: unknown, context: Context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    .populate('savedBooks');

                return userData;
            }
            throw new AuthenticationError('Not logged in');
        }
    },
    Mutation: {
        login: async (_parent: any, { email, password }: UserArgs) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        addUser: async (_parent: any, args: AddUserArgs) => {
            const user = await User.create(args);
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        saveBook: async (_parent: unknown,
            { input }: SaveBookArgs,
            context: Context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user.username},
                    { $addToSet: { savedBooks: input } },
                    { new: true , runValidators: true}
                );

                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');//
        },
        deleteBook: async (_parent: any, { bookId }: { bookId: string }, context: Context) => {
            if (context.user) {
                return await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
};

export default resolvers;
