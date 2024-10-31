// resolvers.ts: Define the query and 
//mutation functionality to work with 




import  User  from '../models/User.js';
import { signToken, AuthenticationError } from '../services/auth.js';

interface User {
    _id: string;
    username: string;
    email: string;
    bookCount: number;
    savedBooks: [Book];
}
    
    interface Book {
        bookId: string;
        authors: [string];
        description: string;
        title: string;
        image: string;
        link: string;
    }
    
    interface Context {
        user: User;
    }
    
    interface Args {
        username: string;
        email: string;
        password: string;
    }
    
    // interface BookArgs {
    //     authors: [string];
    //     description: string;
    //     title: string;
    //     bookId: string;
    //     image: string;
    //     link: string;
    // }
    
    interface SaveBookArgs {
        authors: [string];
        description: string;
        title: string;
        bookId: string;
        image: string;
        link: string;
    }
   
    
    export const resolvers = {
        Query: {
        me: async (_parent: any, _args: any, context: Context) => {
            if (context.user) {
            const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password')
                .populate('savedBooks');
    
            return userData;
            }
            throw new AuthenticationError('Not logged in');
        },
        


        },
        Mutation: {
        login: async (_parent: any, { email, password }: Args) => {
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
        addUser: async (_parent: any, args: Args) => {
            const user = await User.create(args);
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        saveBook: async (_parent: any, args: SaveBookArgs, context: Context) => {
            if (context.user) {
            const updatedUser = await User.findOneAndUpdate(

                { _id: context.user._id },
                { $addToSet: { savedBooks: args } },
                { new: true, runValidators: true }
            );

            return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        },

        deleteBook: async (_parent: any, { bookId }: {bookId:string}, context: Context) => {
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








        